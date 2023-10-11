
import { APIUser } from "discord-api-types/v10";

export class User {
    public readonly avatar: string | null;
    public readonly avatarDecoration?: null | string;
    public readonly discriminator: string;
    public readonly globalName: null | string;
    public readonly id: string;
    public readonly flags?: number;
    public readonly username: string;

    constructor(data: APIUser) {
        this.avatar = data.avatar;
        this.avatarDecoration = data.avatar_decoration;
        this.discriminator = data.discriminator;
        this.globalName = data.global_name;
        this.id = data.id;
        this.flags = data.public_flags;
        this.username = data.username;

    }
    
    avatarURL(extension: "webp" | "png" | "jpg" | "jpeg" | "gif", size: 128 | 256 | 512 | 1024 | 2048) {
        return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${extension}?size=${size}`;
    }

    get displayName() {
        return this.globalName ?? this.username;
    }

    get tag() {
        return this.discriminator === '0' ? this.username : this.username + "#" + this.discriminator;
    }

    get createdTimestamp() {
        return Number(BigInt(this.id) >> 22n) + 1420070400000;
    }
}