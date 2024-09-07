export function getFlags<T extends Record<string, any>>(values: T, flags: number) {
    type FlagKey = keyof T;
    const newFlags: FlagKey[] = [];

    function resolve(bit: string) {
        if (values[bit] !== undefined) return values[bit];
    
        throw Error("");
    }

    function has(bit: any, flags: number) {
        bit = resolve(bit);
        return (flags & bit) === bit;
    }

    for (const bitName of Object.keys(values) as any[]) {
        if (isNaN(bitName) && has(bitName, flags)) newFlags.push(bitName);
    }

    return newFlags;
}