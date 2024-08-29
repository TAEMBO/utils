import { ChatInputCommand } from "#structures";
import { timeFromSnowflake } from "#util";

export default new ChatInputCommand({
    async run(app, interaction) {
        await app.api.interactions.reply(interaction.id, interaction.token, { content: "Pinging...", flags: app.ephemeral });

        const msg = await app.api.webhooks.getMessage(app.config.clientId, interaction.token, "@original");

        await app.api.interactions.editReply(app.config.clientId, interaction.token, {
            content: `Round-trip: \`${timeFromSnowflake(msg.id) - timeFromSnowflake(interaction.id)}\`ms`
        });
    },
    data: {
        name: "ping",
        description: "Check this application's ping"
    }
});