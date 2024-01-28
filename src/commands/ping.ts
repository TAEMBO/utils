import { APIChatInputApplicationCommandInteraction } from "discord-api-types/payloads/v10";
import App from "../app.js";
import { timeFromSnowflake } from "../utilities.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
    async execute(app: typeof App, interaction: APIChatInputApplicationCommandInteraction) {
        await app.api.interactions.reply(interaction.id, interaction.token, { content: "Pinging..." });

        const msg = await app.api.webhooks.getMessage(app.config.id, interaction.token, "@original");

        await app.api.interactions.editReply(app.config.id, interaction.token, {
            content: `Round-trip: \`${timeFromSnowflake(msg.id) - timeFromSnowflake(interaction.id)}\`ms`
        });
    },
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check bot's ping")
};
