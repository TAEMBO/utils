import Config from '../config.json' assert { type: 'json' };
import { Routes } from 'discord-api-types/v10';

export class REST {
    private globalRateLimit = false;
    private globalRateLimitReset = 0;
    private routeRateLimits = new Map();
    private auth = {
        Authorization: `Bot ${this.config.token}`
    };
    private readonly API = "https://discord.com/api/v10";

    constructor(private config: typeof Config) { }

    public async get<T = Record<any, any>>(route: string): Promise<T | null> {
        return this.fetch(this.API + route, {
            method: "GET",
            headers: this.auth
        });
    }

    public async post(route: string, body: any) {
        return this.fetch(this.API + route, {
            method: "POST",
            headers: this.auth,
            body: JSON.stringify(body)
        });
    }

    public async patch(route: string, body: any) {
        return this.fetch(this.API + route, {
            method: "PATCH",
            headers: this.auth,
            body: JSON.stringify(body)
        });
    }

    public async delete(route: string) {
        return this.fetch(this.API + route, {
            method: "DELETE",
            headers: this.auth
        });
    }

    private async fetch(endpoint: string, data: object) {
        if (this.globalRateLimit && Date.now() < this.globalRateLimitReset) {
            const delay = this.globalRateLimitReset - Date.now();

            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const routeData = this.routeRateLimits.get(endpoint);

        if (routeData) {
            if (routeData.remaining === 0 && Date.now() < routeData.reset) {
                const delay = routeData.reset - Date.now();

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        const response = await fetch(endpoint, data);
        const rateLimitHeaders = response.headers.get("x-ratelimit-bucket") ? response.headers : null;

        if (rateLimitHeaders) {
            const endpoint = rateLimitHeaders.get("x-ratelimit-bucket");

            this.routeRateLimits.set(endpoint, {
                limit: parseInt(rateLimitHeaders.get("x-ratelimit-limit") as string),
                remaining: parseInt(rateLimitHeaders.get("x-ratelimit-remaining") as string),
                reset: parseInt(rateLimitHeaders.get("x-ratelimit-reset") as string) * 1000
            });
        } else {
            this.globalRateLimit = false;
            this.globalRateLimitReset = 0;
        }
    
        if (response.status === 429 && response.headers.has("x-ratelimit-global")) {
            this.globalRateLimit = true;
            this.globalRateLimitReset = parseInt(response.headers.get("retry-after") as string) + Date.now();
        }
    
        if (response.status !== 200) return null;

        return response.json() as Promise<Record<any, any>>;
      }
}