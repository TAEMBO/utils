import { APIMessageComponentInteraction } from "@discordjs/core/http-only";

export interface CollectorOptions {
    filter?: (int: APIMessageComponentInteraction) => any;
    max?: number;
    timeout?: number;
};