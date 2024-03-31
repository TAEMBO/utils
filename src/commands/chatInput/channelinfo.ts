import { SlashCommandBuilder } from "@discordjs/builders";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "../../structures/index.js";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const channel = options.getChannel("channel", true);

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: `\`\`\`js\n${formatWithOptions({ depth: 5 }, "%O", channel).slice(0, 1990)}\`\`\``
        });
    },
    data: new SlashCommandBuilder()
        .setName("channelinfo")
        .setDescription("Get API data on a channel")
        .addChannelOption(x => x
            .setName("channel")
            .setDescription("The channel to get API data on")
            .setRequired(true))
});