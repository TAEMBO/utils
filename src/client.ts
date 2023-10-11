import express, { Request } from "express";
import fs from "node:fs";
import { InteractionResponseType, verifyKeyMiddleware } from "discord-interactions";
import { EventEmitter } from "node:events";
import { GuildMember, BaseInteraction, User, ChatInputCommandInteraction } from "./utilities.js";
import config from './config.json' assert { type: 'json' };
import { REST } from "./utilities/rest.js";
import { MessagePayLoad, TypedRequest } from "./typings.js";
import { APIEmbed, APIInteraction, APIMessage, InteractionType, ApplicationCommandType, ComponentType } from "discord-api-types/v10";

export default class Client extends EventEmitter {
    webserver = express();
    rest = new REST(config);
    users = new Map<string, User>();
    members = new Map<string, GuildMember>();
    guilds = new Map<string, any>();
    commands = new Map<string, any>();
    channels = new Map<string, any>();
    config = config;

    constructor() {
        super();
        this.init();
    }

    async init() {
        for (const file of fs.readdirSync('./commands')) {
            const command = await import(`./commands/${file}`);

            // if (!(command.default.data instanceof SlashCommandBuilder)) console.log('NOT_SLASHCOMMANDBUILDER', command.default.data.name);

            this.commands.set(command.default.data.name, command.default);
        }
        
        const listener = this.webserver.listen(5600, '0.0.0.0', () => console.log("Live on", listener.address()));
        
        this.webserver.post("/interactions", verifyKeyMiddleware(this.config.publicKey), async (req, res) => {
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
        });
    }

    async sendDm(userId: string, data: MessagePayLoad) {
        const dmFetch = await this.rest.fetch(`https://discord.com/api/v10/users/@me/channels`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${this.config.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                recipient_id: userId,
            }),
        });

        if (dmFetch.status !== 200) return null;

        const { id } = await dmFetch.json();
        const response = await this.rest.fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${this.config.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: data.content ? data.content : "",
                embeds: data.embeds?.map(x => x),
                components: data.components?.map((component) => (this.isJSON(component) ? component : component.toJSON())),
                attachments: data.files?.map((file, index) => ({ id: index.toString(), description: file.description })),
            })
        });

        if (response.status !== 200) return null;

        return await response.json();
    }

    async send(channelId: string, data: MessagePayLoad) {
        const response = await this.rest.fetch(`https://discord.com/api/channels/${channelId}/messages`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${this.config.token}`
            },
            body: JSON.stringify({
                content: data.content ? data.content : "",
                embeds: data.embeds?.map(x => x),
                components: data.components?.map((component) => (this.isJSON(component) ? component : component.toJSON())),
                attachments: data.files?.map((file, index) => ({ id: index.toString(), description: file.description })),
            })
        });

        if (response.status !== 200) return null;

        return await response.json();
    }

    async getMsg(channelId: string, messageId: string) {
        const response = await this.rest.fetch(`https://discord.com/api/channels/${channelId}/messages/${messageId}`, {
            method: "GET",
            headers: {
                Authorization: `Bot ${this.config.token}`
            }
        });

        if (response.status !== 200) return null;

        const userData = await response.json();

        return userData;
    }

    async getUser(userId: string) {
        const userCache = this.users.get(userId);

        if (userCache) return userCache;

        const response = await this.rest.fetch(`https://discord.com/api/users/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bot ${this.config.token}`
            }
        });

        if (response.status !== 200) return null;

        const userData = new User(await response.json());

        this.users.set(userId, userData);

        return userData;
    }

    async getMember(guildId: string, userId: string) {
        const memberCache = this.members.get(`${guildId}_${userId}`);

        if (memberCache) return memberCache;

        const response = await this.rest.fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bot ${this.config.token}`
            }
        });

        if (response.status !== 200) return null;

        const userData = await response.json();

        this.members.set(`${guildId}_${userId}`, userData);

        return userData;
    }

    async getGuild(guildId: string) {
        const guildCache = this.guilds.get(guildId);

        if (guildCache) return guildCache;

        const response = await this.rest.fetch(`https://discord.com/api/guilds/${guildId}`, {
            method: "GET",
            headers: {
                Authorization: `Bot ${this.config.token}`
            }
        });

        if (response.status !== 200) return null;

        const guildData = await response.json();

        this.guilds.set(guildId, guildData);

        return guildData;
    }

    async getChannel(channelId: string) {
        const channelCache = this.channels.get(channelId);

        if (channelCache) return channelCache;

        const response = await this.rest.fetch(`https://discord.com/api/channels/${channelId}`, {
            method: "GET",
            headers: {
                Authorization: `Bot ${this.config.token}`
            }
        });

        if (response.status !== 200) return null;

        const channelData = await response.json();

        this.channels.set(channelId, channelData);

        return channelData
    }

    async getChannels(guildId: string) {
        const response = await this.rest.fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
            method: "GET",
            headers: {
                Authorization: `Bot ${this.config.token}`
            }
        });

        if (response.status !== 200) return null;

        const channels = await response.json();

        return channels;
    }

    isJSON(data: any) {
        return data !== null && typeof data === "object" && "toJSON" in data;
    }
}