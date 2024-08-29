import type {
    APIUserApplicationCommandInteraction,
    APIMessageApplicationCommandInteraction,
    ApplicationCommandType,
    RESTPostAPIContextMenuApplicationCommandsJSONBody
} from "@discordjs/core/http-only";
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
    public run: (app: App, interaction: TInteraction, options: InteractionOptionResolver) => Promise<any>;
    /** The builder data for this command */
    public readonly data: TCommand extends "message"
        ? RESTPostAPIContextMenuApplicationCommandsJSONBody & { type: ApplicationCommandType.Message }
        : RESTPostAPIContextMenuApplicationCommandsJSONBody & { type: ApplicationCommandType.User };

    public constructor(commandData: ContextMenuCommand<TCommand, TInteraction>) {
        this.run = commandData.run;
        this.data = commandData.data;
    }
}