import { time } from "@discordjs/builders";
import { ChatInputCommand } from "#structures";
import { timeFromSnowflake } from "#util";
import { ApplicationCommandOptionType } from "@discordjs/core";

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
    data: {
        name: "snowflake",
        description: "Get timestmap info from a given snowflake",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "snowflake",
                description: "The snowflake to get timestmap info on",
                min_length: 16,
                max_length: 20,
                required: true
            }
        ]
    }
});
