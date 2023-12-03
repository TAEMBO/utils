import { InteractionResponseType } from "discord-interactions";
import { ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "../utilities.js";
import { ButtonStyle, ComponentType } from "discord-api-types/payloads/v10";

export default {
    data: {
        name: "ping"
    },
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            components: [
                {
                    "type": ComponentType.ActionRow,
                    "components": [
                        {
                            "type": ComponentType.RoleSelect,
                            "custom_id": "role-menu"
                        }
                    ]
                },
                {
                    "type": ComponentType.ActionRow,
                    "components": [
                        {
                            "type": ComponentType.Button,
                            "custom_id": "beans",
                            "style": ButtonStyle.Success,
                            "label": "Beans"
                        }
                    ]
                }
            ]
        });

        // const msg = await interaction.reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, { embeds: [new EmbedBuilder().setTitle("Pinging...").toJSON()] });

        // await interaction.editReply({ content: `Ping: ${msg.createdTimestamp - interaction.createdTimestamp}`, embeds: [] });
    }
};
