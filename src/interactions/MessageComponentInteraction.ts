import Client from "../client.js";
import { BaseInteraction } from "./BaseInteraction.js";
import { ComponentType } from "discord-api-types/v10";

export class MessageComponentInteraction extends BaseInteraction {
    customId: string;
    componentType: ComponentType;

    constructor(public data: any, public client: Client) {
        super(data, client);

        this.customId = data.data.custom_id;
        this.componentType = data.data.component_type;
    }
}