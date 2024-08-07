import type { APIUser } from "@discordjs/core/http-only";

/**
 * 
 * @param user 
 * @returns A string with the given user"s tag, global name if present, and codeblocked ID
 */
export function formatUser(user: APIUser) {
    if (user.global_name) {
        return [
            `<@${user.id}>`,
            user.global_name,
            `\`${user.id}\``
        ].join("\n");
    } else return [
        `<@${user.id}>`,
        `\`${user.id}\``
    ].join("\n");
}