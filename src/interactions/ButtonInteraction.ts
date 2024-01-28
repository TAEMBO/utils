import App from "../app.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";

export class ButtonInteraction extends MessageComponentInteraction {
    constructor(public data: any, public client: typeof App) {
        super(data, client);


    }
}