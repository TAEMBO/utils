import { type SlashCommandBuilder, type SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { type APIMessageComponentInteraction } from "@discordjs/core/http-only";

export interface CollectorOptions {
    filter?: (int: APIMessageComponentInteraction) => any;
    max?: number;
    timeout?: number;
};

export type CombinedSlashCommandBuilder = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder;