import { ApplicationCommandType } from "@discordjs/core/http-only";
import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { formatWithOptions } from "node:util";
import { ContextMenuCommand } from "../../structures/index.js";

export default new ContextMenuCommand<"user">({
    async run(app, interaction) {
        const targetUser = await app.api.users.get(interaction.data.target_id);
        const targetMember = interaction.data.resolved.members?.[interaction.data.target_id] && {
            ...interaction.data.resolved.members[interaction.data.target_id],
            user: targetUser
        };

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: `\`\`\`js\n${formatWithOptions({ depth: 5 }, "%O", targetMember ?? targetUser).slice(0, 1990)}\`\`\``
        });
    },
    data: new ContextMenuCommandBuilder()
        .setName("User Info")
        .setType(ApplicationCommandType.User)
});