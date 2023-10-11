import { InteractionResponseFlags, InteractionType } from "discord-interactions";
import { APIEmbed } from "discord-api-types/v10";
import { Request , Response } from "express";
import Client from "../client.js";
import { CollectorOptions } from "../typings.js";
import { User, GuildMember, Collector, Message, ChatInputCommandInteraction } from "../utilities.js";

interface ReplyOptions {
    Title?: string;
    custom_id?: string;
    embeds?: APIEmbed[];
    ephemeral?: boolean;
    content?: string;
    components?: any[];
    flags?: any;
    files?: any[];
}

export class BaseInteraction {
    id: string;
    user: User;
    member: GuildMember | null;
    token: string;
    type: InteractionType;
    locale: string | null;
    channelId: string;
    guildId: string | null;
    customId: string | null;

    constructor(public req: Request, public res: Response, public client: Client) {
        this.id = req.body.id;
        this.member = req.body.member ? new GuildMember(req.body.member) : null;
        this.user = new User(req.body?.member?.user ?? req.body.user);
        this.token = req.body.token;
        this.type = req.body.type;
        this.locale = req.body.locale ?? null;
        this.channelId = req.body.channel_id;
        this.guildId = req.body.guild_id;
        this.customId = req.body.data.custom_id ?? null;
    }

    isChatInputCommand(): this is ChatInputCommandInteraction {
        return this.type === InteractionType.APPLICATION_COMMAND;
    }

    get createdTimestamp() {
        return Number(BigInt(this.id) >> 22n) + 1420070400000;
    }

    async reply(type: number, data: ReplyOptions) {
        data.flags = data.ephemeral ? InteractionResponseFlags.EPHEMERAL : null;

        this.res.send({ type, data });
        const replyData = await this.client.rest.get(`/webhooks/${this.client.config.id}/${this.token}/messages/@original`);
        
        return new Message(await replyData.json());
    }
    async editReply(data: ReplyOptions) {
        const replyData = await (await fetch(`https://discord.com/api/webhooks/${this.client.config.id}/${this.token}/messages/@original`, {
            method: "PATCH",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: data.content ? data.content : null,
                embeds: data.embeds && data.embeds?.length ? data.embeds?.map((embed) => this.client.isJSON(embed) ? embed : embed) : null,
                components: data.components && data.components?.length ? data.components?.map((component) => (this.client.isJSON(component) ? component : component.toJSON())) : null,
                attachments: data.files && data.files?.length ? data.files?.map((file, index) => ({ id: index.toString(), description: file.description })) : null,
            })
        })).json();

        return new Message(replyData);
    }
    async followUp(data: ReplyOptions) {
        const replyData = await (await fetch(`https://discord.com/api/webhooks/${this.client.config.id}/${this.token}/`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: data.content ? data.content : "",
                embeds: data.embeds?.map((embed) => this.client.isJSON(embed) ? embed : embed),
                components: data.components?.map((component) => (this.client.isJSON(component) ? component : component.toJSON())),
                attachments: data.files?.map((file, index) => ({ id: index.toString(), description: file.description })),
            })
        })).json();

        return replyData;
    }
    async update(data: ReplyOptions) {
        const replyData = await (await fetch(`https://discord.com/api/interactions/${this.id}/${this.token}/callback`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: 7,
                data: {
                    content: data.content ? data.content : null,
                    embeds: data.embeds && data.embeds?.length ? data.embeds?.map((embed) => this.client.isJSON(embed) ? embed : embed) : null,
                    components: data.components && data.components?.length ? data.components?.map((component) => (this.client.isJSON(component) ? component : component.toJSON())) : null,
                    attachments: data.files && data.files?.length ? data.files?.map((file, index) => ({ id: index.toString(), description: file.description })) : null,
                },
            })
        }));

        if(replyData.status !== 204) return null;
        const updatedData = await (await fetch(`https://discord.com/api/webhooks/${this.client.config.id}/${this.token}/messages/@original`, { method: "GET" })).json();

        return updatedData;
    }

    createCollector(optins: CollectorOptions) {
        return new Collector(this, optins);
    }
};