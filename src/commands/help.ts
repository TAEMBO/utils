import { InteractionResponseType } from "discord-interactions";
import { ChatInputCommandInteraction } from "../utilities.js";

export default {
    data: {
        name: "help"
    },
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply(
        {
            components: [{
                "type": 1,
                "components": [{
                    "type": 6,
                    "custom_id":
                    "role-menu"
                }]
            }]
        });

        const collector = interaction.createCollector({ filter: i => i.user.id === interaction.user.id && i.customId === "role-menu" });

        collector.on("collect", async interaction => {
            interaction.reply({ content: "Hey there! This is a collector test!" });
        });
    }
};
