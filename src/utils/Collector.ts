import { EventEmitter } from "node:events";
import { CollectorOptions } from "../typings.js";
import { APIBaseInteraction, APIMessageComponentInteraction, InteractionType } from "@discordjs/core/http-only";
import App from "../app.js";

declare interface Collector {
    on(event: 'collect', listener: (args: APIBaseInteraction<InteractionType, any>) => any): this;
    on(event: 'end', listener: (args: APIBaseInteraction<InteractionType, any>[]) => any): this;
}

class Collector extends EventEmitter {  
    collected: APIBaseInteraction<InteractionType, any>[];
    timer: NodeJS.Timeout | undefined;
    filter: (int: APIMessageComponentInteraction) => any;

    constructor(private app: typeof App, private options: CollectorOptions = {}) {
        super();
        this.collected = [];
        this.filter = options.filter ?? (() => true);
        this.timer = options.timeout ? setTimeout(() => this.end("timeout"), options.timeout) : undefined;

        app.addListener("interaction", (value: APIMessageComponentInteraction) => {
            if (value.type !== InteractionType.MessageComponent) return;
            
            this.emit("collect", value);

            this.collected.push(value);
            
            if (options.max && this.collected.length === options.max) {
                this.end("max");
            }
        });
    }

    resetTimer(newTimeout?: number) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.end("timeout");
        }, newTimeout ?? this.options?.timeout);
    }

    collection(...args: APIMessageComponentInteraction[]) {
        const pass = this.filter(args[0]);
        if (!pass) return;
        this.emit("collect", args[0]);
        this.collected.push(args[0]); 
        if (this.collected && this.collected.length === this.options?.max) {
            this.end();
        }
    }
    end(reason?: string) {
        this.app.removeListener("interaction", this.collection);
        clearTimeout(this.timer);
        this.emit("end", this.collected);
        return true;
    }
}

export { Collector };