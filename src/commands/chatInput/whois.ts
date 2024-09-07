import {
    type APIUser,
    ApplicationCommandOptionType,
    ApplicationFlags,
    UserFlags,
    type APIEmbedField,
    ApplicationIntegrationType,
    ButtonStyle
} from "@discordjs/core/http-only";
import { ActionRowBuilder, ButtonBuilder, codeBlock, EmbedBuilder, roleMention, time } from "@discordjs/builders";
import { formatWithOptions } from "node:util";
import { ChatInputCommand } from "#structures";
import { Collector, formatUser, getFlags, timeFromSnowflake } from "#util";
import type { ApplicationRPC } from "#typings";

export default new ChatInputCommand({
    async run(app, interaction, options) {
        async function getApplicationData(user: APIUser) {
            if (!user.bot) return [];

            let applicationData;

            try {
                applicationData = await app.api.rest.get(`/applications/${user.id}/rpc`) as ApplicationRPC;
            } catch (err) {
                return [];
            }

            const fields: APIEmbedField[] = [];

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
                value: getFlags(ApplicationFlags, applicationData.flags).join(", ")
            });

            if (applicationData.integration_types_config) fields.push({
                name: "🔹Installation types",
                value: Object.keys(applicationData.integration_types_config).map(x => ApplicationIntegrationType[parseInt(x)]).join(", ")
            });

            fields.push({ name: "🔹 Bot is public", value: applicationData.bot_public ? "Yes" : "No" });

            return fields;
        }

        const member = options.getMember("user");
        const user = await app.api.users.get(options.getUser("user", true).id);
        const titlePrefix = user.bot
            ? "Bot"
            : member
                ? "Member"
                : "User";
        const embed = new EmbedBuilder()
            .setThumbnail(user.avatar ? app.api.rest.cdn.avatar(user.id, user.avatar, { extension: "png", size: 1024 }) : null)
            .setTitle(`${titlePrefix} info: ${user.username}`)
            .setURL(`https://discord.com/users/${user.id}`)
            .setDescription(formatUser(user))
            .addFields({
                name: `🔹 ${user.bot ? "Bot" : "Account"} created`,
                value: `<t:${Math.round(timeFromSnowflake(user.id) / 1_000)}:R>`,
                inline: true
            })
            .setColor(app.config.embedColor)
            .setImage(user.banner ? app.api.rest.cdn.banner(user.id, user.banner, { extension: "png", size: 1024 }) : null);

        if (member) {
            embed.addFields(
                {
                    name: "🔹 Joined server",
                    value: time(new Date(member.joined_at), "R"),
                    inline: true
                },
                {
                    name: `🔹 Roles: ${member.roles.length}`,
                    value: member.roles.length
                        ? member.roles
                            .map(roleMention)
                            .join(" ")
                            .slice(0, 1024)
                        : "None"
                }
            );

            if (member.premium_since) embed.addFields({
                name: "🔹 Server Boosting Since",
                value: time(new Date(member.premium_since), "R"),
                inline: true
            });
        }

        if (user.flags) embed.addFields({
            name: "🔹 Flags",
            value: getFlags(UserFlags, user.flags).join(", "),
            inline: true
        });

        const appData = await getApplicationData(user);

        if (appData.length) embed.addFields(appData);
        
        await app.api.interactions.reply(interaction.id, interaction.token, {
            embeds: [embed.toJSON()],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder()
                .setCustomId("raw")
                .setStyle(ButtonStyle.Primary)
                .setLabel("Raw")
            ).toJSON()],
            flags: app.ephemeral
        });

        new Collector(app, {
            filter: int => (int.member ?? int).user!.id === (interaction.member ?? interaction).user!.id,
            max: 1,
            timeout: 20_000
        }).on("collect", async int => {
            const rawMemberData = member && {
                ...member,
                user
            };

            await app.api.interactions.updateMessage(int.id, int.token, {
                content: codeBlock("js", formatWithOptions({ depth: 5 }, "%O", rawMemberData ?? user).slice(0, 1990)),
                components: [],
                embeds: []
            });
        }).on("end", async (ints) => {
            if (!ints.length) await app.api.interactions.editReply(app.config.clientId, interaction.token, { components: [] });
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
