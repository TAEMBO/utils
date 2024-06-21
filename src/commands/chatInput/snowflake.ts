import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommand } from "../../structures/index.js";
import { timeFromSnowflake } from "../../utilities.js";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const snowflake = options.getString("snowflake", true);
        
        if (!Number(snowflake)) return await app.api.interactions.reply(interaction.id, interaction.token, {
            content: "Invalid snowflake provided",
            flags: app.ephemeral
        });

        const unixTime = Math.round(timeFromSnowflake(snowflake) / 1_000);

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: `Snowflake: \`${snowflake}\`\nTime: <t:${unixTime}> - <t:${unixTime}:R>\nUnix: \`${unixTime}\``,
            flags: app.ephemeral
        });
    },
    data: new SlashCommandBuilder()
        .setName("snowflake")
        .setDescription("Get timestamp info from a given snowflake")
        .addStringOption(x => x
            .setName("snowflake")
            .setDescription("The snowflake to get timestamp info on")
            .setRequired(true)
            .setMinLength(16)
            .setMaxLength(20))
});