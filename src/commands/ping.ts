import { timeFromSnowflake } from "../utilities.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../structures/command.js";

export default new Command({
    async run(app, interaction) {
        await app.api.interactions.reply(interaction.id, interaction.token, { content: "Pinging..." });

        const msg = await app.api.webhooks.getMessage(app.config.id, interaction.token, "@original");

        await app.api.interactions.editReply(app.config.id, interaction.token, {
            content: `Round-trip: \`${timeFromSnowflake(msg.id) - timeFromSnowflake(interaction.id)}\`ms`
        });
    },
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check bot's ping")
});