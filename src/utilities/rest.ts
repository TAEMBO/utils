import Config from '../config.json' assert { type: 'json' };

export class REST {
    private globalRateLimit = false;
    private globalRateLimitReset = 0;
    private routeRateLimits = new Map();
    private auth = {
        Authorization: `Bot ${this.config.token}`
    };
    private readonly API = "https://discord.com/api/v10";

    constructor(private config: typeof Config) { }

    async get(route: string) {
        return await this.fetch(this.API + route, {
            method: "GET",
            headers: this.auth
        });
    }

    async post(route: string, body: any) {
        return await this.fetch(this.API + route, {
            method: "POST",
            headers: this.auth,
            body: JSON.stringify(body)
        });
    }

    async patch(route: string, body: any) {
        return await this.fetch(this.API + route, {
            method: "PATCH",
            headers: this.auth,
            body: JSON.stringify(body)
        });
    }

    async delete(route: string) {
        return await this.fetch(this.API + route, {
            method: "DELETE",
            headers: this.auth
        });
    }

    async fetch(endpoint: string, data: object) {
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
    
        return response;
      }
}