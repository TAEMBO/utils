import type { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import type { APIMessageComponentInteraction } from "@discordjs/core/http-only";

export interface CollectorOptions {
    filter?: (int: APIMessageComponentInteraction) => boolean;
    max?: number;
    timeout?: number;
}

export type CombinedSlashCommandBuilder = SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

export interface ApplicationRPC {
    bot_public: boolean;
    bot_require_code_grant: boolean;
    description: string;
    flags: number;
    hook: boolean;
    icon: string;
    id: string;
    name: string;
    summary: string;
    tags?: string[];
}