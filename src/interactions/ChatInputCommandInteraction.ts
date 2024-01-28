import Client from "../client.js";
import { BaseInteraction } from "./BaseInteraction.js";
import { ChatInputCommandInteractionOptions } from "../utilities/ChatInputCommandInteractionOptions.js";

export class ChatInputCommandInteraction extends BaseInteraction {
    options: ChatInputCommandInteractionOptions;
    commandName: string;

    constructor(public data: any, public client: Client) {
        super(data, client);

        this.options = new ChatInputCommandInteractionOptions(this);
        this.commandName = data.data?.name;
    }
}