import { InteractionResponseFlags, InteractionType, InteractionResponseType } from "discord-interactions";
import { APIEmbed, APIMessage, ComponentType, Routes } from "discord-api-types/v10";
import { Request , Response } from "express";
import Client from "../client.js";
import { CollectorOptions } from "../typings.js";
import { User, GuildMember, Collector, Message, ChatInputCommandInteraction } from "../utilities.js";
import { ButtonInteraction } from "./ButtonInteraction.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";

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
    application_id: string;
    id: string;
    user: User;
    member: GuildMember | null;
    token: string;
    type: InteractionType;
    locale: string | null;
    channelId: string;
    guildId: string | null;

    constructor(public data: any, public client: Client) {
        this.application_id = data.application_id;
        this.id = data.id;
        this.member = data.member ? new GuildMember(data.member) : null;
        this.user = new User(data.member?.user ?? data.user);
        this.token = data.token;
        this.type = data.type;
        this.locale = data.locale ?? null;
        this.channelId = data.channel_id;
        this.guildId = data.guild_id;
    }

    isChatInputCommand(): this is ChatInputCommandInteraction {
        return this.type === InteractionType.APPLICATION_COMMAND;
    }

    isMessageComponent(): this is MessageComponentInteraction {
        return this.type === InteractionType.MESSAGE_COMPONENT;
    }

    isButton(): this is ButtonInteraction {
        if (!this.isMessageComponent()) return false;

        return this.componentType === ComponentType.Button;
    }

    get createdTimestamp() {
        return Number(BigInt(this.id) >> 22n) + 1420070400000;
    }

    async reply(data: ReplyOptions) {
        data.flags = data.ephemeral ? InteractionResponseFlags.EPHEMERAL : null;

        await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
            body: {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data
            }
        });

        const replyData = await this.client.rest.get(Routes.webhookMessage(this.application_id, this.token)) as APIMessage;
        
        return new Message(replyData);
    }
    async editReply(data: ReplyOptions) {
        const replyData = await (await fetch(`https://discord.com/api/webhooks/${this.application_id}/${this.token}/messages/@original`, {
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
        const replyData = await (await fetch(`https://discord.com/api/webhooks/${this.application_id}/${this.token}/`, {
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
        const replyData = await fetch(`https://discord.com/api/interactions/${this.id}/${this.token}/callback`, {
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
        });

        if(replyData.status !== 204) return null;
        const updatedData = await (await fetch(`https://discord.com/api/webhooks/${this.application_id}/${this.token}/messages/@original`, { method: "GET" })).json();

        return updatedData;
    }

    createCollector(optins: CollectorOptions) {
        return new Collector(this, optins);
    }
};