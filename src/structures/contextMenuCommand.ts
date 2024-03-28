import type { APIUserApplicationCommandInteraction, APIMessageApplicationCommandInteraction } from "@discordjs/core/http-only";
import type { ContextMenuCommandBuilder } from "@discordjs/builders";
import type App from "../app.js";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";

/**
 * Creates a new instance of an application command
 */
export class ContextMenuCommand<
    TCommand extends "message" | "user",
    TInteraction = TCommand extends "message"
        ? APIMessageApplicationCommandInteraction
        : APIUserApplicationCommandInteraction,
> {
    /** The function that is ran for this command */
    run: (app: typeof App, interaction: TInteraction, options: InteractionOptionResolver) => Promise<any>;
    /** The builder data for this command */
    readonly data: ContextMenuCommandBuilder;

    constructor(commandData: {
        readonly data: ContextMenuCommandBuilder;
        run(app: typeof App, interaction: TInteraction, options: InteractionOptionResolver): Promise<any>;
    }) {
        this.run = commandData.run;
        this.data = commandData.data;
    }
}