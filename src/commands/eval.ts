import { ButtonStyle } from "@discordjs/core/http-only";
import { performance } from "perf_hooks";
import { setTimeout as sleep } from "node:timers/promises";
import util from "node:util";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { Collector } from "../utilities.js";
import { Command } from "../structures/command.js";

export default new Command({
    async run(app, interaction, options) {
        sleep;
        const code = options.getString("code", true);
        const depth = options.getInteger("depth") ?? 1;
        const useAsync = Boolean(options.getString("async", false));
        const embed = new EmbedBuilder()
            .setTitle("__Eval__")
            .setColor(4203516)
            .addFields({ name: "Input", value: `\`\`\`js\n${code.slice(0, 1010)}\`\`\`` });
        const now = performance.now();
        let output;

        try {
            output = await eval(useAsync ? `(async () => { ${code} })()` : code);
        } catch (err: any) {
            console.log(err);
            
            embed
                .setColor(16711680)
                .addFields({
                    name: `Output • ${(performance.now() - now).toFixed(5)}ms`,
                    value: `\`\`\`\n${err}\`\`\``
                });

            const msgPayload = {
                embeds: [embed.toJSON()],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId("stack").setStyle(ButtonStyle.Primary).setLabel("Stack")).toJSON()],
            };

            const msg = await app.api.interactions.reply(interaction.id, interaction.token, msgPayload)
                .then(() => app.api.webhooks.getMessage(app.config.id, interaction.token, "@original"))
                .catch(() => app.api.channels.createMessage(interaction.channel.id, msgPayload));

            new Collector(app, { filter: (int) => int.member?.user.id === interaction.member?.user.id, max: 1 })
                .on("collect", int => app.api.interactions.reply(int.id, int.token, { content: `\`\`\`\n${err.stack.slice(0, 1950)}\`\`\`` }))
                .on("end", () => app.api.channels.editMessage(interaction.channel.id, msg.id, { components: [] }));

            return;
        }

        // Output manipulation
        if (typeof output === "object") {
            output = "js\n" + util.formatWithOptions({ depth }, "%O", output);
        } else output = "\n" + String(output);

        embed.addFields({ name: `Output • ${(performance.now() - now).toFixed(5)}ms`, value: `\`\`\`${output.slice(0, 1016)}\n\`\`\`` });

        await app.api.interactions.reply(interaction.id, interaction.token, { embeds: [embed.toJSON()] })
            .catch(() => app.api.channels.createMessage(interaction.channel.id, { embeds: [embed.setFooter({ text: "Reply timeout" }).toJSON()] }));
    },
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Execute code within the application")
        .addStringOption(x => x
            .setName("code")
            .setDescription("The code to execute")
            .setRequired(true))
        .addIntegerOption(x => x
            .setName("depth")
            .setDescription("The depth of the output")
            .setMaxValue(5))
        .addBooleanOption(x => x
            .setName("async")
            .setDescription("Whether to wrap the code in an async block or not"))
});