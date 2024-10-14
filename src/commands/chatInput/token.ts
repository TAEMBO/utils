import { ApplicationCommandOptionType, type RESTGetAPIGatewayBotResult, Routes } from "@discordjs/core";
import { codeBlock } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "#structures";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        const token = options.getString("token", true);

        try {
            const data = await new REST().setToken(token.trim()).get(Routes.gatewayBot()) as RESTGetAPIGatewayBotResult;
            const result = { ...data, id: Buffer.from(token.split(".")[0], "base64") };

            await app.api.interactions.reply(interaction.id, interaction.token, {
                content: codeBlock("js", formatWithOptions({ depth: 5 }, "%O", result).slice(0, 1990)),
                flags: app.ephemeral
            });
        } catch (err) {
            await app.api.interactions.reply(interaction.id, interaction.token, { content: "Invalid token", flags: app.ephemeral });
        }
    },
    data: {
        name: "token",
        description: "Get info on a token",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "token",
                description: "The token to get info on",
                min_length: 65,
                max_length: 75,
                required: true
            }
        ]
    }
});
