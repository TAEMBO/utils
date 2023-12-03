import Client from "../client.js";
import { Request , Response } from "express";
import { BaseInteraction } from "./BaseInteraction.js";
import { ChatInputCommandInteractionOptions } from "../utilities/ChatInputCommandInteractionOptions.js";
import { APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";
import { TypedRequest } from "../typings.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";

export class ButtonInteraction extends MessageComponentInteraction {
    constructor(public req: Request, public res: Response, public client: Client) {
        super(req, res, client);


    }
}