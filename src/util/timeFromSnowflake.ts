/**
 * Get a UNIX timestamp based on a snowflake
 * @param id The snowflake ID to use
 * @returns A UNIX timestamp
 */
export function timeFromSnowflake(id: string) {
    if (!Number(id)) {
        return new Date(id).getTime();
    } else {
        return Number(BigInt(id) >> 22n) + 1420070400000;
    }
}