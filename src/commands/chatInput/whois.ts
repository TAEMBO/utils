import { EmbedBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType, type APIEmbedField } from "@discordjs/core/http-only";
import { ChatInputCommand } from "#structures";
import { formatUser, getApplicationFlags, getUserFlags, timeFromSnowflake } from "#util";
import type { ApplicationRPC } from "#typings";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        async function getApplicationData(id: string) {
            const applicationData = await app.api.rest.get(`/applications/${id}/rpc`).catch(() => null) as ApplicationRPC | null;
            const fields: APIEmbedField[] = [];

            if (!applicationData) return;

            if (applicationData.description) fields.push({
                name: "🔹 Bot description",
                value: applicationData.description
            });

            if (applicationData.tags?.length) fields.push({
                name: "🔹 Bot tags",
                value: applicationData.tags.join(", ")
            });

            if (applicationData.flags) fields.push({
                name: "🔹 Bot flags",
                value: getApplicationFlags(applicationData.flags).join(", ")
            });

            fields.push({ name: "🔹 Bot is public", value: applicationData.bot_public ? "Yes" : "No" });

            return fields;
        }

        const member = options.getMember("user");
        const user = await app.api.users.get(options.getUser("user", true).id);
        
        if (!member) {
            const appData = await getApplicationData(user.id);
            const embed = new EmbedBuilder()
                .setThumbnail(user.avatar ? app.api.rest.cdn.avatar(user.id, user.avatar, { extension: "png", size: 1024 }) : null)
                .setTitle(`${user.bot ? "Bot" : "User"} info: ${user.username}`)
                .setURL(`https://discord.com/users/${user.id}`)
                .setDescription(formatUser(user))
                .addFields(
                    { name: `🔹 ${user.bot ? "Bot" : "Account"} created`, value: `<t:${Math.round(timeFromSnowflake(user.id) / 1_000)}:R>` },
                    { name: "🔹 Flags", value: getUserFlags(user.flags ?? 0).join(", ") || "None" }
                )
                .setColor(app.config.embedColor)
                .setImage(user.banner ? app.api.rest.cdn.banner(user.id, user.banner, { extension: "png", size: 1024 }) : null);

            if (appData) embed.addFields(...appData);

            return await app.api.interactions.reply(interaction.id, interaction.token, {
                embeds: [embed.toJSON()],
                flags: app.ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setThumbnail(user.avatar ? app.api.rest.cdn.avatar(user.id, user.avatar, { extension: "png", size: 1024 }) : null)
            .setTitle(`${user.bot ? "Bot" : "Member"} info: ${user.username}`)
            .setURL(`https://discord.com/users/${user.id}`)
            .setDescription(formatUser(user))
            .addFields(
                { name: "🔹 Account created", value: `<t:${Math.round(timeFromSnowflake(user.id) / 1_000)}:R>`, inline: true },
                { name: "🔹 Joined server", value: `<t:${Math.round(timeFromSnowflake(member.joined_at) / 1_000)}:R>`, inline: true },
                {
                    name: `🔹 Roles: ${member.roles.length}`,
                    value: member.roles.length
                        ? member.roles
                            .map(x => `<@&${x}>`)
                            .join(member.roles.length > 4 ? " " : "\n")
                            .slice(0, 1024)
                        : "None"
                },
                { name: "🔹 Flags", value: getUserFlags(user.flags ?? 0).join(", ") || "None", inline: true }
            )
            .setColor(app.config.embedColor)
            .setImage(user.banner ? app.api.rest.cdn.banner(user.id, user.banner, { extension: "png", size: 1024 }) : null);

        if (member.premium_since) embed.addFields([{
            name: "🔹 Server Boosting Since",
            value: `<t:${Math.round(timeFromSnowflake(member.premium_since) / 1_000)}:R>`,
            inline: true
        }]);

        if (user.bot) {
            const appData = await getApplicationData(user.id);

            if (appData) embed.addFields(...appData);

            return await app.api.interactions.reply(interaction.id, interaction.token, {
                embeds: [embed.toJSON()],
                flags: app.ephemeral
            });
        }
        
        await app.api.interactions.reply(interaction.id, interaction.token, {
            embeds: [embed.toJSON()],
            flags: app.ephemeral
        });
    },
    data: {
        name: "whois",
        description: "Get info on a user",
        options: [
            {
                type: ApplicationCommandOptionType.User,
                name: "user",
                description: "The user to get info on",
                required: true
            }
        ]
    }
});
