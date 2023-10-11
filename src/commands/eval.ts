import { EmbedBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from '../utilities.js';


export default {
    data: {
        name: "eval"
    },
    async execute(interaction: ChatInputCommandInteraction) {
        console.log(interaction.options.subcommand);
        
        const codetoeval = "";
        
        console.log(`${interaction.user.username} used Eval they inputted ${codetoeval}`);
        
        try {
            const result = eval(codetoeval)
            const evaledcode = new EmbedBuilder()
                .addFields({ name: "Input", value: `\`${codetoeval}\`` }, { name: 'Evaled Code', value: `\`${result}\`` })
            interaction.reply(4, { embeds: [evaledcode.toJSON()], ephemeral: false })
        } catch (err) {
            const codeerr = new EmbedBuilder().addFields({ name: "Input", value: `\`${codetoeval}\`` }, { name: "Error", value: `\`${err}\`` })
            interaction.reply(4, { embeds: [codeerr.toJSON()], ephemeral: true })
        }
    }
};
