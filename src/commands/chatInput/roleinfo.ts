import { ApplicationCommandOptionType } from "@discordjs/core/http-only";
import { codeBlock } from "@discordjs/builders";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "#structures";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const role = options.getRole("role", true);

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: codeBlock("js", formatWithOptions({ depth: 5 }, "%O", role).slice(0, 1990)),
            flags: app.ephemeral
        });
    },
    data: {
        name: "roleinfo",
        description: "Get API data on a role",
        options: [
            {
                type: ApplicationCommandOptionType.Role,
                name: "role",
                description: "The role to get API data on",
                required: true
            }
        ]
    }
});
