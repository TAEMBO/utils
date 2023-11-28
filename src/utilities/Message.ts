import { APIEmbed, APIMessage } from "discord-api-types/v10";
import { User } from "./User.js";

export class Message {
    id: string;
    type: number;
    content: string;
    channelId: string;
    author: User;
    attachments: any[];
    embeds: APIEmbed[];
    mentions: any[];
    mentionedRoles: any[];
    pinned: boolean;
    mentionEveryone: boolean;
    tts: boolean;

    constructor(data: APIMessage) {
        this.id = data.id;
        this.type = data.type;
        this.content = data.content;
        this.channelId = data.channel_id;
        this.author = new User(data.author);
        this.attachments = data.attachments;
        this.embeds = data.embeds;
        this.mentions = data.mentions;
        this.mentionedRoles  = data.mention_roles;
        this.pinned = data.pinned;
        this.mentionEveryone = data.mention_everyone;
        this.tts = data.tts;
    }
    get createdTimestamp() {
        return Number(BigInt(this.id) >> 22n) + 1420070400000;
    }
}