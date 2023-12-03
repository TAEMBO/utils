import Client from "../client.js";
import { Request , Response } from "express";
import { BaseInteraction } from "./BaseInteraction.js";
import { ChatInputCommandInteractionOptions } from "../utilities/ChatInputCommandInteractionOptions.js";
import { APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";
import { TypedRequest } from "../typings.js";

export class ChatInputCommandInteraction extends BaseInteraction {
    options: ChatInputCommandInteractionOptions;
    commandName: string;

    constructor(public data: any, public client: Client) {
        super(data, client);

        this.options = new ChatInputCommandInteractionOptions(this);
        this.commandName = data.data?.name;
    }
}