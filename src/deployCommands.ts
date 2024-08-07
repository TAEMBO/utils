import { type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import config from "#config" assert { type: "json" };
import { ChatInputCommand, ContextMenuCommand } from "#structures";
import { log } from "#util";

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const rest = new REST().setToken(config.token);

for (const folder of await readdir(resolve("./commands"))) {
    for (const file of await readdir(resolve("./commands", folder))) {
        const commandFile = await import(`./commands/${folder}/${file}`);

        if (
            !(commandFile.default instanceof ChatInputCommand)
            && !(commandFile.default instanceof ContextMenuCommand)
        ) {
            log("Red", `${file} not command`);
    
            continue;
        }

        commands.push({
            ...commandFile.default.data.toJSON(),
            integration_types: [1],
            contexts: [0, 1, 2]
        });
    }
}
 
await rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(data => log("Purple", "Application commands registered", data))
    .catch(console.error);