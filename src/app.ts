import Express from "express";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import config from './config.json' assert { type: "json" };
import { REST } from "@discordjs/rest";
import { Collection } from "@discordjs/collection";
import { verifyKeyMiddleware } from "discord-interactions";
import { API, InteractionType, InteractionResponseType, APIBaseInteraction, APIChatInputApplicationCommandInteraction, ApplicationCommandType } from "@discordjs/core/http-only";
import { OptionResolver } from "./utilities.js";

export default new class App extends EventEmitter {
    readonly config = config;
    readonly express = Express();
    readonly commands = new Collection<string, any>();
    readonly api = new API(new REST().setToken(this.config.token));

    constructor() {
        super();
        this.init();

        process.on("uncaughtException", console.log);
    }

    private async init() {
        for (const file of await readdir(resolve("./commands"))) {
            const command = await import(`./commands/${file}`);
        
            this.commands.set(command.default.data.name, command.default);
        }

        this.express.post(`/${this.config.id}`, verifyKeyMiddleware(this.config.publicKey), (req, res) => {
            const interaction: APIBaseInteraction<InteractionType, any> = req.body;
            
            console.log('/interaction -------------------------------------------', interaction);
            
            if (interaction.type === InteractionType.Ping) {
                return res.send({ type: InteractionResponseType.Pong });
            } else if (((int: typeof interaction): int is APIChatInputApplicationCommandInteraction => {
                return interaction.type === InteractionType.ApplicationCommand && interaction.data.type === ApplicationCommandType.ChatInput;
            })(interaction)) {
                const command = this.commands.get(interaction.data.name);

                if (!command) return;

                command.execute(this, interaction, new OptionResolver(interaction.data.options ?? [], interaction.data.resolved ?? {}));
            }

            this.emit("interaction", interaction);
        }).listen(config.port, config.hostname, () => console.log(`Live on port ${config.port} at endpoint "/${this.config.id}"`));
    }
}();