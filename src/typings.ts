import { APIMessageComponentInteraction } from "discord-api-types/v10";

export interface CollectorOptions {
    filter?: (int: APIMessageComponentInteraction) => any;
    max?: number;
    timeout?: number;
};