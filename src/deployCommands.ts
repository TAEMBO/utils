import { REST } from "@discordjs/rest";
import { type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "@discordjs/core/http-only";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import config from "./config.json" assert { type: "json" };
import { ChatInputCommand, ContextMenuCommand } from "./structures/index.js";
import { log } from "./utilities.js";

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const rest = new REST().setToken(config.token);

for await (const folder of await readdir(resolve("./commands"))) {
    for await (const file of await readdir(resolve("./commands", folder))) {
        const commandFile = await import(`./commands/${folder}/${file}`);

        if (
            !(commandFile.default instanceof ChatInputCommand)
            && !(commandFile.default instanceof ContextMenuCommand)
        ) {
            log("Red", `${file} not command`);
    
            continue;
        }

        commands.push(commandFile.default.data.toJSON());
    }
}
 
await rest.put(Routes.applicationCommands(config.clientId), { body: commands.map(x => ({ ...x, integration_types: [1], contexts: [0, 1, 2] })) })
    .then(data => log("Purple", "Application commands registered", data))
    .catch(console.error);