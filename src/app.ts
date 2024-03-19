import Express from "express";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import config from './config.json' assert { type: "json" };
import { REST } from "@discordjs/rest";
import { Collection } from "@discordjs/collection";
import { verifyKeyMiddleware } from "discord-interactions";
import { API, InteractionType, InteractionResponseType, APIBaseInteraction, APIChatInputApplicationCommandInteraction, ApplicationCommandType } from "@discordjs/core/http-only";
import { OptionResolver, log } from "./utilities.js";
import { Command } from "./structures/command.js";

export default new class App extends EventEmitter {
    readonly config = config;
    readonly express = Express();
    readonly commands = new Collection<string, Command>();
    readonly api = new API(new REST().setToken(this.config.token));

    constructor() {
        super();
        this.init();

        process.on("uncaughtException", console.log);
    }

    private async init() {
        for (const file of await readdir(resolve("./commands"))) {
            const command = await import(`./commands/${file}`);

            if (!(command.default instanceof Command)) {
                log("Red", `${file} not instance of Command`);

                continue;
            }
        
            this.commands.set(command.default.data.name, command.default);
        }

        this.express.post(`/${this.config.publicKey}`, verifyKeyMiddleware(this.config.publicKey), async (req, res) => {
            const interaction: APIBaseInteraction<InteractionType, any> = req.body;
            
            if (interaction.type === InteractionType.Ping) {
                return res.send({ type: InteractionResponseType.Pong });
            } else if (((int: typeof interaction): int is APIChatInputApplicationCommandInteraction => {
                return interaction.type === InteractionType.ApplicationCommand && interaction.data.type === ApplicationCommandType.ChatInput;
            })(interaction)) {
                const command = this.commands.get(interaction.data.name);
                const options = new OptionResolver(interaction.data.options ?? [], interaction.data.resolved ?? {});
                
                if (!command) return;
                
                log("White", [
                    `\x1b[32m${(interaction.member ?? interaction).user!.username}\x1b[37m used `,
                    `/${interaction.data.name} ${options.getSubcommand(false) ?? ""}\x1b[37m in `,
                    `#${interaction.channel?.name ?? interaction.channel.id}`
                ].join("\x1b[32m"));

                await command.run(this, interaction, options);
            }

            this.emit("interaction", interaction);
        }).listen(config.port, config.hostname, () => log("Blue", `Live on \x1b[33m${config.port}\x1b[34m at \x1b[33m/${this.config.publicKey}`));
    }
}();