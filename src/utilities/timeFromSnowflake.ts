export function timeFromSnowflake(id: string) {
    return Number(BigInt(id) >> 22n) + 1420070400000;
}