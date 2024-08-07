import { SlashCommandBuilder, time } from "@discordjs/builders";
import { ChatInputCommand } from "#structures";
import { timeFromSnowflake } from "#util";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const snowflake = options.getString("snowflake", true);
        
        if (!Number(snowflake)) return await app.api.interactions.reply(interaction.id, interaction.token, {
            content: "Invalid snowflake provided",
            flags: app.ephemeral
        });

        const unixTime = new Date(timeFromSnowflake(snowflake));

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content:
                `Snowflake: \`${snowflake}\`\n`
                + `Time: ${time(unixTime)} - ${time(unixTime, "R")}\n`
                + `Unix: \`${unixTime.getTime()}\``,
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