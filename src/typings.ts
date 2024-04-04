import { type SlashCommandBuilder, type SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { type APIMessageComponentInteraction } from "@discordjs/core/http-only";

export interface CollectorOptions {
    filter?: (int: APIMessageComponentInteraction) => boolean;
    max?: number;
    timeout?: number;
};

export type CombinedSlashCommandBuilder = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder;

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