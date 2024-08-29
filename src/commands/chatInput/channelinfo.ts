import { ApplicationCommandOptionType } from "@discordjs/core";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "#structures";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const channel = options.getChannel("channel", true);

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: `\`\`\`js\n${formatWithOptions({ depth: 5 }, "%O", channel).slice(0, 1990)}\`\`\``,
            flags: app.ephemeral
        });
    },
    data: {
        name: "channelinfo",
        description: "Get API data on a channel",
        options: [
            {
                type: ApplicationCommandOptionType.Channel,
                name: "channel",
                description: "The channel to get API data on",
                required: true
            }
        ]
    }
});
