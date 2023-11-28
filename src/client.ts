import express, { Request } from "express";
import fs from "node:fs";
import { InteractionResponseType, verifyKeyMiddleware } from "discord-interactions";
import { EventEmitter } from "node:events";
import { GuildMember, BaseInteraction, User, ChatInputCommandInteraction } from "./utilities.js";
import config from './config.json' assert { type: 'json' };
import { REST } from "./utilities/rest.js";
import { Options, MessagePayLoad, TypedRequest } from "./typings.js";
import { APIEmbed, APIInteraction, APIMessage, InteractionType, ApplicationCommandType, ComponentType, Routes, APIUser, APIGuildMember, APIGuild, APIChannel } from "discord-api-types/v10";

export default class Client extends EventEmitter {
    webserver = express();
    rest = new REST(this.config);
    users = new Map<string, User>();
    members = new Map<string, GuildMember>();
    guilds = new Map<string, any>();
    commands = new Map<string, any>();
    channels = new Map<string, any>();

    constructor(public config: Options) {
        super();
        this.init();
    }

    async init() {
        for (const file of fs.readdirSync('./commands')) {
            const command = await import(`./commands/${file}`);

            // if (!(command.default.data instanceof SlashCommandBuilder)) console.log('NOT_SLASHCOMMANDBUILDER', command.default.data.name);

            this.commands.set(command.default.data.name, command.default);
        }
        
        const listener = this.webserver.listen(this.config.port, this.config.hostname, () => console.log("Live on", listener.address(), `at endpoint "/${this.config.id}"`));
        
        this.webserver.post(`/${this.config.id}`, verifyKeyMiddleware(this.config.publicKey), async (req, res) => {
            console.log('/interaction -------------------------------------------', req.body);

            if (req.body.type === InteractionType.Ping) return res.send({ type: InteractionResponseType.PONG });

            const interactionStructure = (() => {
                if (req.body.type === InteractionType.ApplicationCommand) {
                    return new ChatInputCommandInteraction(req, res, this);
                } else {
                    return new BaseInteraction(req, res, this);
                }
            })();

            this.emit("interaction", interactionStructure);


            if (!interactionStructure.isChatInputCommand()) return;
            
            const cmd = this.commands.get(interactionStructure.commandName);
            
            if(!cmd) return;
        
            cmd.execute(interactionStructure);
        });
    }

    async sendDm(userId: string, data: MessagePayLoad) {
        const dmFetch = await this.rest.post("/users/@me/channels", {
            recipient_id: userId,
        });

        if (!dmFetch) return null;

        return this.rest.post(`/channels/${dmFetch.id}/messages`, {
            content: data.content ? data.content : "",
            embeds: data.embeds?.map(x => x),
            components: data.components?.map((component) => (this.isJSON(component) ? component : component.toJSON())),
            attachments: data.files?.map((file, index) => ({ id: index.toString(), description: file.description })),
        });
    }

    async send(channelId: string, data: MessagePayLoad) {
        return this.rest.post(`/channels/${channelId}/messages`, {
            content: data.content ? data.content : "",
            embeds: data.embeds?.map(x => x),
            components: data.components?.map((component) => (this.isJSON(component) ? component : component.toJSON())),
            attachments: data.files?.map((file, index) => ({ id: index.toString(), description: file.description })),
        });
    }

    async getMsg(channelId: string, messageId: string) {
        return this.rest.get<APIMessage>(`/channels/${channelId}/messages/${messageId}`);
    }

    async getUser(userId: string) {
        const cachedUser = this.users.get(userId);

        if (cachedUser) return cachedUser;

        const response = await this.rest.get<APIUser>(`/users/${userId}`);

        if (!response) return null;

        const userData = new User(response);

        this.users.set(userId, userData);

        return userData;
    }

    async getMember(guildId: string, userId: string) {
        const cachedMember = this.members.get(`${guildId}_${userId}`);

        if (cachedMember) return cachedMember;

        const response = await this.rest.get<APIGuildMember>(`/guilds/${guildId}/members/${userId}`);

        if (!response) return null;

        const memberData = new GuildMember(response);

        this.members.set(`${guildId}_${userId}`, memberData);

        return memberData;
    }

    async getGuild(guildId: string) {
        const guildCache = this.guilds.get(guildId);

        if (guildCache) return guildCache;

        const response = await this.rest.get<APIGuild>(`/guilds/${guildId}`);

        if (!response) return null;

        this.guilds.set(guildId, response);

        return response;
    }

    async getChannel(channelId: string) {
        const channelCache = this.channels.get(channelId);

        if (channelCache) return channelCache;

        const response = await this.rest.get<APIChannel>(`/channels/${channelId}`);

        if (!response) return null;

        this.channels.set(channelId, response);

        return response;
    }

    async getChannels(guildId: string) {
        return this.rest.get(`/guilds/${guildId}/channels`);
    }

    isJSON(data: any) {
        return data !== null && typeof data === "object" && "toJSON" in data;
    }
}