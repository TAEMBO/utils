import { ApplicationCommandOptionType } from "@discordjs/core";
import { codeBlock, subtext } from "@discordjs/builders";
import { format } from "node:util";
import { ChatInputCommand } from "#structures";
import { formatString } from "#util";
import type { IPInfoResult } from "#typings";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        await app.api.interactions.defer(interaction.id, interaction.token);

        const ip = options.getString("ip", true);
        const res = await fetch(process.env.IP_INFO_URL! + ip, { headers: { "User-Agent": process.env.IP_INFO_USER_AGENT! } });
        const result: IPInfoResult = await res.json();
        let content = subtext(`${formatString(result.status)} - ${result.description}`);

        if (result.data) content += "\n" + codeBlock("js", format("%O", result.data.geo).slice(0, 1990));

        await app.api.interactions.editReply(process.env.CLIENT_ID!, interaction.token, { content, flags: app.ephemeral });
    },
    data: {
        name: "ip",
        description: "Get info on an IP or domain",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "ip",
                description: "The IP or domain to get info on",
                required: true
            }
        ]
    }
});
