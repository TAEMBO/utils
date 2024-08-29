import {
    type APIInteraction,
    InteractionType,
    InteractionResponseType,
    ApplicationCommandType,
    type APIChatInputApplicationCommandInteraction,
    type APIContextMenuInteraction
} from "@discordjs/core/http-only";
import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { InteractionOptionResolver } from "@sapphire/discord-utilities";
import App from "./app.js";
import { ChatInputCommand, ContextMenuCommand } from "#structures";
import { log, parser, verifyKey } from "#util";

const app = new App();

for (const folder of await readdir("commands")) {
    for (const file of await readdir(join("commands", folder))) {
        const commandPath = new URL(join("commands", folder, file), import.meta.url);
        const commandFile = await import(commandPath.toString());

        if (
            !(commandFile.default instanceof ChatInputCommand)
            && !(commandFile.default instanceof ContextMenuCommand)
        ) {
            log("Red", `${file} not instance of Command`);

            continue;
        }

        const collectionType = commandFile.default.data instanceof ContextMenuCommandBuilder
            ? "contextMenuCommands"
            : "chatInputCommands";

        app[collectionType].set(commandFile.default.data.name, commandFile.default);
    }
}

app.server.use(parser, verifyKey).post("/", async (req, res) => {
    const interaction: APIInteraction = req.body;

    app.emit("interaction", interaction);

    switch (interaction.type) {
        case InteractionType.Ping:
            res
                .setHeader("Content-Type", "application/json")
                .writeHead(200)
                .end(JSON.stringify({ type: InteractionResponseType.Pong }));
            break;
        case InteractionType.ApplicationCommand: {
            const options = new InteractionOptionResolver(interaction);

            switch (interaction.data.type) {
                case ApplicationCommandType.ChatInput: {
                    const chatInputCmd = app.chatInputCommands.get(interaction.data.name);
                    
                    if (!chatInputCmd) return log("Red", `Command ${interaction.data.name} not found`);
                    
                    log("White", [
                        `\x1b[32m${(interaction.member ?? interaction).user!.username}\x1b[37m used `,
                        `/${interaction.data.name} ${options.getSubcommand(false) ?? ""}\x1b[37m in `,
                        `#${interaction.channel?.name ?? interaction.channel.id}`
                    ].join("\x1b[32m"));
    
                    await chatInputCmd.run(app, interaction as APIChatInputApplicationCommandInteraction, options);
                    break;
                }
                default: {
                    const contextMenuCmd = app.contextMenuCommands.get(interaction.data.name);
                    
                    if (!contextMenuCmd) return log("Red", `Command ${interaction.data.name} not found`);
                    
                    log("White", [
                        `\x1b[32m${(interaction.member ?? interaction).user!.username}\x1b[37m used `,
                        `${interaction.data.name}\x1b[37m in `,
                        `#${interaction.channel.name ?? interaction.channel.id}`
                    ].join("\x1b[32m"));
    
                    await contextMenuCmd.run(app, interaction as APIContextMenuInteraction, options);
                    break;
                }
            }

            break;
        }
        case InteractionType.MessageComponent:
            log("Yellow", "MessageComponent not implemented");
            break;
        case InteractionType.ApplicationCommandAutocomplete:
            log("Yellow", "ApplicationCommandAutocomplete not implemented");
            break;
        case InteractionType.ModalSubmit:
            log("Yellow", "ModalSubmit not implemented");
            break;
    }
}).listen(app.config.port, app.config.hostname, () => log("Blue", `Live on port \x1b[33m${app.config.port}\x1b[34m`));

process.on("uncaughtException", console.log);
