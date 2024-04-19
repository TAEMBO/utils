import { UserFlags } from "@discordjs/core/http-only";

type UserFlagKey = keyof typeof UserFlags;

function resolve(bit: UserFlagKey) {
    if (UserFlags[bit] !== undefined) return UserFlags[bit];

    throw Error("");
}

function has(bit: any, flags: number) {
    bit = resolve(bit);
    return (flags & bit) === bit;
}

export function getUserFlags(flags: number) {
    const newFlags: UserFlagKey[] = [];

    for (const bitName of Object.keys(UserFlags) as any[]) {
        if (isNaN(bitName) && has(bitName, flags)) newFlags.push(bitName);
    }

    return newFlags;
}