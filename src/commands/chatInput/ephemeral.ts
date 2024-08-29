import { ApplicationCommandOptionType, MessageFlags } from "@discordjs/core/http-only";
import { ChatInputCommand } from "#structures";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const ephemeral = options.getBoolean("ephemeral", true);

        if (ephemeral) {
            app.ephemeral = MessageFlags.Ephemeral;
        } else {
            app.ephemeral = undefined;
        }

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: `Ephemeral set to \`${ephemeral}\``,
            flags: MessageFlags.Ephemeral
        });
    },
    data: {
        name: "ephemeral",
        description: "Set whether all replies and follow-ups are ephemeral or not",
        options: [
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "ephemeral",
                description: "Whether to use ephemeral or not",
                required: true
            }
        ]
    }
});
