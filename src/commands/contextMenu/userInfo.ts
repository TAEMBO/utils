import { ApplicationCommandType } from "@discordjs/core/http-only";
import { codeBlock } from "@discordjs/builders";
import { formatWithOptions } from "node:util";
import { ContextMenuCommand } from "#structures";

export default new ContextMenuCommand<"user">({
    async run(app, interaction, options) {
        const targetUser = await app.api.users.get(interaction.data.target_id);
        const resolvedMember = options.getTargetMember();
        const targetMember = resolvedMember && {
            ...resolvedMember,
            user: targetUser
        };

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: codeBlock("js", formatWithOptions({ depth: 5 }, "%O", targetMember ?? targetUser).slice(0, 1990)),
            flags: app.ephemeral
        });
    },
    data: {
        type: ApplicationCommandType.User,
        name: "User Info"
    }
});