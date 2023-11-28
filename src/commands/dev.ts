import { InteractionResponseType } from "discord-interactions";
import { ChatInputCommandInteraction } from "../utilities.js";
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";

export default {
    async execute(interaction: ChatInputCommandInteraction) {
        console.log(interaction.options.subcommand);
        
        interaction.options.get('sus')
        const msg = await interaction.reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, { embeds: [new EmbedBuilder().setTitle("Pinging...").toJSON()] });

        await interaction.editReply({ content: `Ping: ${msg.createdTimestamp - interaction.createdTimestamp}`, embeds: [] });
    },
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('sus')
        .addSubcommand(x => x
            .setName('eval')
            .setDescription('Evaluate code')
            .addStringOption(x => x
                .setName('code')
                .setDescription('The code to evaluate')
                .setRequired(true)))
};
