import * as Discord from "@discordjs/core/http-only";
import * as Builders from "@discordjs/builders";
import { setTimeout as sleep } from "node:timers/promises";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "#structures";
import * as util from "#util";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        await app.api.interactions.defer(interaction.id, interaction.token, { flags: app.ephemeral });

        sleep;
        const code = options.getString("code", true);
        const depth = options.getInteger("depth") ?? 1;
        const useAsync = Boolean(options.getBoolean("async", false));
        const embed = new Builders.EmbedBuilder()
            .setColor(+process.env.EMBED_COLOR!)
            .setDescription(Builders.codeBlock("js", code.slice(0, 1010)));
        const now = performance.now();
        let output;

        try {
            output = await eval(useAsync ? `(async () => { ${code} })()` : code);
        } catch (err: any) {
            util.log("Red", err);
            
            embed
                .setColor(16711680)
                .addFields({
                    name: (performance.now() - now).toFixed(5) + "ms",
                    value: Builders.codeBlock(err)
                });

            await app.api.interactions.editReply(process.env.CLIENT_ID!, interaction.token, {
                embeds: [embed.toJSON()],
                components: [new Builders.ActionRowBuilder<Builders.ButtonBuilder>().addComponents(new Builders.ButtonBuilder()
                    .setCustomId("stack")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setLabel("Stack")
                ).toJSON()],
                flags: app.ephemeral
            });

            new util.Collector(app, {
                filter: int => (int.member ?? int).user!.id === (interaction.member ?? interaction).user!.id,
                max: 1,
                timeout: 60_000
            })
                .on("collect", int => app.api.interactions.reply(int.id, int.token, {
                    content: Builders.codeBlock(err.stack.slice(0, 1950)),
                    flags: app.ephemeral
                }))
                .on("end", () => app.api.interactions.editReply(process.env.CLIENT_ID!, interaction.token, { components: [] }));

            return;
        }

        // Output manipulation
        const formattedOutput = typeof output === "object"
            ? formatWithOptions({ depth }, "%O", output)
            : String(output);

        embed.addFields({
            name: (performance.now() - now).toFixed(5) + "ms • " + util.formatString(typeof output),
            value: Builders.codeBlock("js", formattedOutput.slice(0, 1000))
        });

        await app.api.interactions.editReply(process.env.CLIENT_ID!, interaction.token, { embeds: [embed.toJSON()] });
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
