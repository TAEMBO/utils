import Express from "express";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import config from "./config.json" assert { type: "json" };
import { REST } from "@discordjs/rest";
import { Collection } from "@discordjs/collection";
import { verifyKeyMiddleware } from "discord-interactions";
import {
    APIInteraction,
    API,
    APIContextMenuInteraction,
    APIChatInputApplicationCommandInteraction,
    ApplicationCommandType,
    InteractionResponseType,
    InteractionType
} from "@discordjs/core/http-only";
import { log } from "./utilities.js";
import { ChatInputCommand, ContextMenuCommand } from "./structures/index.js";
import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { InteractionOptionResolver } from "@sapphire/discord-utilities";

export default new class App extends EventEmitter {
    public readonly config = config;
    public readonly express = Express();
    public readonly chatInputCommands = new Collection<string, ChatInputCommand>();
    public readonly contextMenuCommands = new Collection<string, ContextMenuCommand<"message" | "user">>();
    public readonly api = new API(new REST().setToken(this.config.token));

    public constructor() {
        super();
        this.init().catch(console.error);

        process.on("uncaughtException", console.log);
    }

    private async init() {
        for (const folder of await readdir(resolve("./commands"))) {
            for (const file of await readdir(resolve("./commands", folder))) {
                const commandFile = await import(`./commands/${folder}/${file}`);

                if (
                    !(commandFile.default instanceof ChatInputCommand)
                    && !(commandFile.default instanceof ContextMenuCommand)
                ) {
                    log("Red", `${file} not instance of Command`);
    
                    continue;
                }

                const collectionType = commandFile.default.data instanceof ContextMenuCommandBuilder ? "contextMenuCommands": "chatInputCommands";
        
                this[collectionType].set(commandFile.default.data.name, commandFile.default);
            }
        }

        this.express.post(`/${this.config.publicKey}`, verifyKeyMiddleware(this.config.publicKey), async (req, res) => {
            const interaction: APIInteraction = req.body;

            this.emit("interaction", interaction);

            switch (interaction.type) {
                case InteractionType.Ping:
                    res.send({ type: InteractionResponseType.Pong });
                    break;
                case InteractionType.ApplicationCommand: {
                    const options = new InteractionOptionResolver(interaction);

                    switch (interaction.data.type) {
                        case ApplicationCommandType.ChatInput: {
                            const chatInputCmd = this.chatInputCommands.get(interaction.data.name);
                            
                            if (!chatInputCmd) return log("Red", `Command ${interaction.data.name} not found`);
                            
                            log("White", [
                                `\x1b[32m${(interaction.member ?? interaction).user!.username}\x1b[37m used `,
                                `/${interaction.data.name} ${options.getSubcommand(false) ?? ""}\x1b[37m in `,
                                `#${interaction.channel?.name ?? interaction.channel.id}`
                            ].join("\x1b[32m"));
            
                            await chatInputCmd.run(this, interaction as APIChatInputApplicationCommandInteraction, options);
                            break;
                        }
                        default: {
                            const contextMenuCmd = this.contextMenuCommands.get(interaction.data.name);
                            
                            if (!contextMenuCmd) return log("Red", `Command ${interaction.data.name} not found`);
                            
                            log("White", [
                                `\x1b[32m${(interaction.member ?? interaction).user!.username}\x1b[37m used `,
                                `${interaction.data.name}\x1b[37m in `,
                                `#${interaction.channel.name ?? interaction.channel.id}`
                            ].join("\x1b[32m"));
            
                            await contextMenuCmd.run(this, interaction as APIContextMenuInteraction, options);
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

        }).listen(config.port, config.hostname, () => log("Blue", `Live on \x1b[33m${config.port}\x1b[34m at \x1b[33m/${this.config.publicKey}`));
    }
}();