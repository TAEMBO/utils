import { InteractionContextType, ApplicationIntegrationType, type RESTPostAPIApplicationCommandsJSONBody, Routes } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { ChatInputCommand, ContextMenuCommand } from "#structures";
import { log } from "#util";

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const rest = new REST().setToken(process.env.TOKEN!);

for (const folder of await readdir(new URL("commands", import.meta.url))) {
    for (const file of await readdir(new URL(join("commands", folder), import.meta.url))) {
        const commandPath = new URL(join("commands", folder, file), import.meta.url);
        const commandFile = await import(commandPath.toString());

        if (
            !(commandFile.default instanceof ChatInputCommand)
            && !(commandFile.default instanceof ContextMenuCommand)
        ) {
            log("Red", `${file} not command`);
    
            continue;
        }

        commands.push({
            ...commandFile.default.data,
            integration_types: [ApplicationIntegrationType.UserInstall],
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]
        });
    }
}
 
await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands })
    .then(data => log("Purple", "Application commands registered", data))
    .catch(console.error);