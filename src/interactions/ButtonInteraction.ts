import Client from "../client.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";

export class ButtonInteraction extends MessageComponentInteraction {
    constructor(public data: any, public client: Client) {
        super(data, client);


    }
}