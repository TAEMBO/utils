import { EventEmitter } from "node:events";
import { BaseInteraction } from "../utilities.js";
import { CollectorOptions } from "../typings.js";
import { MessageComponentInteraction } from "src/interactions/MessageComponentInteraction.js";


declare interface Collector {
    on(event: 'collect', listener: (args: BaseInteraction) => any): this;
    on(event: 'end', listener: (args: BaseInteraction[]) => any): this;
}

class Collector extends EventEmitter {  
    collected: BaseInteraction[];
    timer: NodeJS.Timer | undefined;
    filter: (int: MessageComponentInteraction) => any;

    constructor(private interaction: BaseInteraction, private options?: CollectorOptions) {
        super();
        this.collected = [];
        this.filter = options?.filter ?? (() => true);
        this.timer = options?.timeout ? setTimeout(() => this.end("timeout"), this.options?.timeout) : undefined;

        interaction.client.addListener("interaction", (value: MessageComponentInteraction) => {

            this.emit("collect", value);

            this.collected.push(value);
            
            if (options?.max && this.collected.length === options?.max) {
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

    collection(...args: Array<MessageComponentInteraction>) {
        const pass = this.filter(args[0]);
        if(!pass) return;
        this.emit("collect", args[0]);
        this.collected.push(args[0]); 
        if(this.collected && this.collected.length === this.options?.max){
            this.end();
        }
    }
    end(reason?: string) {
        this.interaction.client.removeListener("interaction", this.collection);
        clearTimeout(this.timer);
        this.emit("end", this.collected);
        return true;
    }
}

export { Collector };