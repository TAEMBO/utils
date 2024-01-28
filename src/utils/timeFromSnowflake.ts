/**
 * Get a UNIX timestamp based on a snowflake
 * @param id The snowflake ID to use
 * @returns A UNIX timestamp
 */
export function timeFromSnowflake(id: string) {
    return Number(BigInt(id) >> 22n) + 1420070400000;
}