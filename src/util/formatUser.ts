import type { APIUser } from "@discordjs/core/http-only";

/**
 * 
 * @param user 
 * @returns A string with the given user"s tag, global name if present, and codeblocked ID
 */
export function formatUser(user: APIUser) {
    return `
        <@${user.id}>
        ${user.global_name ? user.global_name + " - " : ""}\`${user.id}\`
    `;
}