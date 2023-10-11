import Client from './client.js'
import { BaseInteraction } from './utilities.js';

const client = new Client();

client.on("interaction", async (interaction: BaseInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    
    if(!cmd) return;

    cmd.execute(interaction);
});
process.on("uncaughtException", console.log);