import { ApplicationFlags } from "@discordjs/core/http-only";

type ApplicationFlagKey = keyof typeof ApplicationFlags;

function resolve(bit: ApplicationFlagKey) {
    if (ApplicationFlags[bit] !== undefined) return ApplicationFlags[bit];

    throw Error("");
}

function has(bit: any, flags: number) {
    bit = resolve(bit);
    return (flags & bit) === bit;
}

export function getApplicationFlags(flags: number) {
    const newFlags: ApplicationFlagKey[] = [];

    for (const bitName of Object.keys(ApplicationFlags) as any[]) {
        if (isNaN(bitName) && has(bitName, flags)) newFlags.push(bitName);
    }

    return newFlags;
}