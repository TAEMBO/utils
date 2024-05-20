import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommand } from "../../structures/index.js";
import { timeFromSnowflake } from "../../utilities.js";

export default new ChatInputCommand({
    async run(app, interaction) {
        await app.api.interactions.reply(interaction.id, interaction.token, { content: "Pinging...", flags: app.ephemeral });

        const msg = await app.api.webhooks.getMessage(app.config.clientId, interaction.token, "@original");

        await app.api.interactions.editReply(app.config.clientId, interaction.token, {
            content: `Round-trip: \`${timeFromSnowflake(msg.id) - timeFromSnowflake(interaction.id)}\`ms`
        });
    },
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check bot's ping")
});