import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommand } from "../../structures/index.js";
import { MessageFlags } from "@discordjs/core/http-only";

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
            flags: app.ephemeral
        });
    },
    data: new SlashCommandBuilder()
        .setName("ephemeral")
        .setDescription("Set whether all replies and follow-ups are ephemeral or not")
        .addBooleanOption(x => x
            .setName("ephemeral")
            .setDescription("Whether to use ephemeral or not")
            .setRequired(true))
});