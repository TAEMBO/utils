import type App from "../app.js";
import type { APIChatInputApplicationCommandInteraction } from "@discordjs/core/http-only";
import type { CombinedSlashCommandBuilder } from "../typings.js";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";

/**
 * Creates a new instance of an application command
 */
export class ChatInputCommand {
    /** The function that is ran for this command */
    run: (app: typeof App, interaction: APIChatInputApplicationCommandInteraction, options: InteractionOptionResolver) => Promise<any>;
    /** The builder data for this command */
    readonly data: CombinedSlashCommandBuilder;

    constructor(commandData: {
        readonly data: CombinedSlashCommandBuilder;
        run(app: typeof App, interaction: APIChatInputApplicationCommandInteraction, options: InteractionOptionResolver): Promise<any>;
    }) {
        this.run = commandData.run;
        this.data = commandData.data;
    }
}