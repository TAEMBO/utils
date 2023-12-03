import Client from "../client.js";
import { Request , Response } from "express";
import { BaseInteraction } from "./BaseInteraction.js";
import { ChatInputCommandInteractionOptions } from "../utilities/ChatInputCommandInteractionOptions.js";
import { APIChatInputApplicationCommandInteraction, ComponentType } from "discord-api-types/v10";
import { TypedRequest } from "../typings.js";

export class MessageComponentInteraction extends BaseInteraction {
    customId: string;
    componentType: ComponentType;

    constructor(public data: any, public client: Client) {
        super(data, client);

        this.customId = data.data.custom_id;
        this.componentType = data.data.component_type;
    }
}