import type { APIMessageComponentInteraction, ApplicationIntegrationType } from "@discordjs/core/http-only";
import type { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";

export interface CollectorOptions {
    filter?: (int: APIMessageComponentInteraction) => boolean;
    max?: number;
    timeout?: number;
}

export interface IPInfoResult {
    status: string;
    description: string;
    data?: {
        geo: Record<string, string | number | null>;
    };
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
    integration_types_config?: Record<ApplicationIntegrationType, { oauth2_install_params: { scopes: string[], permissions: string } }>;
}