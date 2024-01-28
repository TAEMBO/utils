import Express from "express";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import config from './config.json' assert { type: "json" };
import { GuildMember, BaseInteraction, User, ChatInputCommandInteraction } from "./utilities.js";
import { REST } from "@discordjs/rest";
import { Options } from "./typings.js";
import { InteractionType, InteractionResponseType, APIBaseInteraction, APIApplicationCommandInteraction } from "discord-api-types/v10";
import { Collection } from "@discordjs/collection";
import { verifyKeyMiddleware } from "discord-interactions";

export default new class App extends EventEmitter {
    express = Express();
    rest = new REST().setToken(this.options.token);
    users = new Collection<string, User>();
    members = new Collection<string, GuildMember>();
    guilds = new Collection<string, any>();
    commands = new Collection<string, any>();
    channels = new Collection<string, any>();

    constructor(public options: Options) {
        super();
        this.init();

        process.on("uncaughtException", console.log);
    }

    private async init() {
        for (const file of await readdir(resolve("./commands"))) {
            const command = await import(`./commands/${file}`);
        
            this.commands.set(command.default.data.name, command.default);
        }

        this.express.post(`/${this.options.id}`, verifyKeyMiddleware(this.options.publicKey), async (req, res) => {
            const interaction: APIBaseInteraction<InteractionType, any> = req.body;
            
            console.log('/interaction -------------------------------------------', interaction);
            
            if (interaction.type === InteractionType.Ping) {
                return res.send({ type: InteractionResponseType.Pong });
            } else if (((int: typeof interaction): int is APIApplicationCommandInteraction => {
                return interaction.type === InteractionType.ApplicationCommand;
            })(interaction)) {
                const command = this.commands.get(interaction.data.name);

                if (!command) return;

                command.execute(new ChatInputCommandInteraction(interaction, this));
            }

            this.emit("interaction", interaction);
        }).listen(config.port, config.hostname, () => console.log(`Live on port ${config.port} at endpoint "/${this.options.id}"`));
    }

    isJSON(data: any) {
        return data !== null && typeof data === "object" && "toJSON" in data;
    }
}(config)