import {  } from '../typings.js';
import { User } from '../utilities.js';
import { APIGuildMember } from 'discord-api-types/v10'; 

export class GuildMember {
    public readonly user?: User | null;

    constructor(data: APIGuildMember) {
        this.user = data.user ? new User(data.user) : null;
    }
}