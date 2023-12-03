import { ApplicationCommandOptionType, APIEmbed, APIChatInputApplicationCommandInteraction, APIInteraction } from "discord-api-types/v10";
import { BaseInteraction } from "./utilities.js";
import { Request } from "express";
import { MessageComponentInteraction } from "./interactions/MessageComponentInteraction.js";

export interface CollectorOptions {
    filter?: (int: MessageComponentInteraction) => any;
    max?: number;
    timeout?: number;
};

export interface Options {
    token: string;
    publicKey: string;
    id: string;
    port: number;
    hostname: string;

}

export type ChatInputCommandInteractionOption = ChatInputCommandInteractionOptionBase &
    (
        { type: ApplicationCommandOptionType.Boolean, value: boolean }
        | { type: ApplicationCommandOptionType.String, value: string }
        | { type: ApplicationCommandOptionType.Number, value: number }
        | { type: ApplicationCommandOptionType.Subcommand }
        | { type: ApplicationCommandOptionType.SubcommandGroup }
        | { type: ApplicationCommandOptionType.Channel }
        | { type: ApplicationCommandOptionType.User }
        | { type: ApplicationCommandOptionType.Role }
    );


export interface TypedRequest extends Request {
    body: APIInteraction;
}

export interface ChatInputCommandInteractionOptionBase {
    name: string;
    type: ApplicationCommandOptionType;
    autocomplete?: boolean;
    options: ChatInputCommandInteractionOptionBase[];
}
export interface MessagePayLoad {
    embeds?: APIEmbed[];
    ephemeral?: boolean;
    content?: string;
    components?: any[];
    flags?: any;
    files?: any[];
}

export interface SlashCommandOptionChoiceData<T> {
    name: string;
    value: T;

}

export interface SlashCommandBaseOptionData<T> {
    name: string;
    description: string;
    type: number;
    choices?: SlashCommandOptionChoiceData<T>[];

}

export interface SlashCommandStringOptionData extends SlashCommandBaseOptionData<string> {
    type: 3;
}


export interface SlashCommandNumberOptionData extends SlashCommandBaseOptionData<number> {
    type: 10;
}
export interface SlashCommandData {
    name: string;
    description: string;
    options: []
}
export interface SlashCommandOption {
    name: string;
    value: string;
    type: number;
}
export interface APIUser {
    avatar: string;
    avatar_decoration_data: null | string;
    discriminator: string;
    global_name: null | string;
    id: string;
    public_flags: number;
    username: string;
}
export interface APIGuildMember {
    user: APIUser;
}
export interface APIEmbedField {
    name: string;
    value: string;
    inline?: string;
}
export interface APIEmbedAuthor {
    name: string;
    url?: string;
    icon_url?: string;
}
export interface APIEmbedFooter {
    text: string;
    icon_url?: string;
}
export interface APIEmbedImage {
    url: string;
}
export interface APIEmbedThumbnail {
    url: string;
}

export interface Modal {
    title?: string;
    custom_id?: string;
    components?: Array<any>;
}

export interface Button {
    label?: string;
    custom_id?: string;
    url?: string;
    disabled?: boolean
    type: number;
    style?: number;
}