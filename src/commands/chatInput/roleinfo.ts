import { SlashCommandBuilder } from "@discordjs/builders";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "#structures";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const role = options.getRole("role", true);

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: `\`\`\`js\n${formatWithOptions({ depth: 5 }, "%O", role).slice(0, 1990)}\`\`\``,
            flags: app.ephemeral
        });
    },
    data: new SlashCommandBuilder()
        .setName("roleinfo")
        .setDescription("Get API data on a role")
        .addRoleOption(x => x
            .setName("role")
            .setDescription("The role to get API data on")
            .setRequired(true))
});