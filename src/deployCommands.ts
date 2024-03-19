import { REST } from "@discordjs/rest";
import { type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "@discordjs/core/http-only";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import config from "./config.json" assert { type: "json" };
import { Command } from "./structures/command.js";

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const rest = new REST().setToken(config.token);

for await (const file of await readdir(join(process.cwd(), "commands"))) {
    const command: { default: Command } = await import(`./commands/${file}`);

    if (!(command.default instanceof Command)) {
        console.log(`${file} not instance of Command`);

        continue;
    }

    commands.push(command.default.data.toJSON());
}

await rest.put(Routes.applicationCommands(config.clientId), { body: commands.map(x => ({ ...x, integration_types: [1], contexts: [0, 1, 2] })) })
    .then(data => console.log("Application commands registered", data))
    .catch(console.error);