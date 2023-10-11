import { InteractionResponseType } from "discord-interactions";
import { EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "../utilities.js";

export default {
    data: {
        name: "ping"
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const msg = await interaction.reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, { embeds: [new EmbedBuilder().setTitle("Pinging...").toJSON()] });

        await interaction.editReply({ content: `Ping: ${msg.createdTimestamp - interaction.createdTimestamp}`, embeds: [] });
    }
};
