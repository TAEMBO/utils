import * as Discord from "@discordjs/core/http-only";
import * as Builders from "@discordjs/builders";
import { setTimeout as sleep } from "node:timers/promises";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "#structures";
import * as utils from "#util";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        await app.api.interactions.defer(interaction.id, interaction.token, { flags: app.ephemeral });

        sleep;
        const code = options.getString("code", true);
        const depth = options.getInteger("depth") ?? 1;
        const useAsync = Boolean(options.getBoolean("async", false));
        const embed = new Builders.EmbedBuilder()
            .setTitle("__Eval__")
            .setColor(app.config.embedColor)
            .addFields({ name: "Input", value: `\`\`\`js\n${code.slice(0, 1010)}\`\`\`` });
        const now = performance.now();
        let output;

        try {
            output = await eval(useAsync ? `(async () => { ${code} })()` : code);
        } catch (err: any) {
            utils.log("Red", err);
            
            embed
                .setColor(16711680)
                .addFields({
                    name: `Output • ${(performance.now() - now).toFixed(5)}ms`,
                    value: `\`\`\`\n${err}\`\`\``
                });

            await app.api.interactions.editReply(app.config.clientId, interaction.token, {
                embeds: [embed.toJSON()],
                components: [new Builders.ActionRowBuilder<Builders.ButtonBuilder>().addComponents(new Builders.ButtonBuilder()
                    .setCustomId("stack")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setLabel("Stack")
                ).toJSON()],
                flags: app.ephemeral
            });

            new utils.Collector(app, {
                filter: int => (int.member ?? int).user!.id === (interaction.member ?? interaction).user!.id,
                max: 1,
                timeout: 60_000
            })
                .on("collect", int => app.api.interactions.reply(int.id, int.token, { content: `\`\`\`\n${err.stack.slice(0, 1950)}\`\`\``, flags: app.ephemeral }))
                .on("end", () => app.api.interactions.editReply(app.config.clientId, interaction.token, { components: [] }));

            return;
        }

        // Output manipulation
        if (typeof output === "object") {
            output = "js\n" + formatWithOptions({ depth }, "%O", output);
        } else output = "\n" + String(output);

        embed.addFields({
            name: `Output • ${(performance.now() - now).toFixed(5)}ms`,
            value: `\`\`\`${output.slice(0, 1016)}\n\`\`\``
        });

        await app.api.interactions.editReply(app.config.clientId, interaction.token, { embeds: [embed.toJSON()] });
    },
    data: {
        name: "eval",
        description: "Execute code within the application",
        options: [
            {
                type: Discord.ApplicationCommandOptionType.String,
                name: "code",
                description: "The code to execute",
                required: true
            },
            {
                type: Discord.ApplicationCommandOptionType.Integer,
                name: "depth",
                description: "The depth of the output",
                max_value: 5,
                required: false
            },
            {
                type: Discord.ApplicationCommandOptionType.Boolean,
                name: "async",
                description: "Whether to wrap the code in an async block or not",
                required: false
            }
        ]
    }
});
