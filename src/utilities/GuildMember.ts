import { APIGuildMember } from '../typings.js';
import { User } from '../utilities.js';

export class GuildMember {
    public readonly user: User;

    constructor(data: APIGuildMember) {
        this.user = new User(data.user);
    }
}