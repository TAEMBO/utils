import Client from "../client.js";
import { Request , Response } from "express";
import { BaseInteraction } from "./BaseInteraction.js";
import { ChatInputCommandInteractionOptions } from "../utilities/ChatInputCommandInteractionOptions.js";
import { APIChatInputApplicationCommandInteraction, ComponentType } from "discord-api-types/v10";
import { TypedRequest } from "../typings.js";

export class MessageComponentInteraction extends BaseInteraction {
    customId: string;
    componentType: ComponentType;

    constructor(public req: Request, public res: Response, public client: Client) {
        super(req, res, client);

        this.customId = req.body.data.custom_id;
        this.componentType = req.body.data.component_type;
    }
}