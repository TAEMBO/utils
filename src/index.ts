import Express from "express";
import Client from './client.js';
import config from './config.json' assert { type: "json" };
import fs from "node:fs";
import { InteractionResponseType, verifyKeyMiddleware } from "discord-interactions";
import { InteractionType } from "discord-api-types/v10";



const server = Express();
const client = new Client(config);
const listener = server.listen(config.port, config.hostname, () => console.log("Live on", listener.address(), `at endpoint "/${client.options.id}"`));

for (const file of fs.readdirSync('./commands')) {
    const command = await import(`./commands/${file}`);

    client.commands.set(command.default.data.name, command.default);
}
        
server.post(`/${client.options.id}`, verifyKeyMiddleware(client.options.publicKey), async (req, res) => {
    console.log('/interaction -------------------------------------------', req.body);
    
    if (req.body.type === InteractionType.Ping) return res.send({ type: InteractionResponseType.PONG });

    const interaction = client.getInteraction(req.body);

    if (!interaction.isChatInputCommand()) return;
    
    const cmd = client.commands.get(interaction.commandName);
    
    if(!cmd) return;

    cmd.execute(interaction);
});

process.on("uncaughtException", console.log);