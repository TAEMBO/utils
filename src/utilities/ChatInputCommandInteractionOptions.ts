import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "../interactions/ChatInputCommandInteraction.js";

export class ChatInputCommandInteractionOptions {
    public subcommand: string | null = null;
    public group: string | null = null;
    private _options = new Map<string, any>();
    
    constructor(public interactionData: ChatInputCommandInteraction) {
        const { body } = interactionData.req;

        if (!body.data.options) return;

        for (const option of body.data.options) {
            switch (option.type) {
                case ApplicationCommandOptionType.Subcommand:
                    const subCmd = option;

                    this.subcommand = subCmd.name;

                    if (!subCmd.options) break;

                    for (const subCmdOption of subCmd.options) {
                        switch (subCmdOption.type) {
                            case ApplicationCommandOptionType.User: 
                                if (!body.data.resolved?.users || !body.data.resolved?.members) continue;

                                this._options.set(subCmdOption.name, Object.assign(body.data.resolved.users[subCmdOption.value], { member: body.data.resolved?.members[subCmdOption.value] }));
                            case ApplicationCommandOptionType.Channel:
                                if (!body.data.resolved?.channels) continue;

                                this._options.set(subCmdOption.name, body.data.resolved.channels[subCmdOption.value]);
                            case ApplicationCommandOptionType.Role:
                                if (!body.data.resolved?.roles) continue;

                                this._options.set(subCmdOption.name, body.data.resolved.roles[subCmdOption.value]);
                            default:
                                this._options.set(subCmdOption.name, subCmdOption.value);
                        }
                    }

                    break;
                case ApplicationCommandOptionType.SubcommandGroup:
                    this.group = option.name;

                    for (const subOption of option.options) {
                        this.subcommand = subOption.name;
                        
                        if (!subOption.options) continue;

                        for (const subSubOtion of subOption.options) {
                            switch (subSubOtion.type) {
                                case ApplicationCommandOptionType.User: 
                                    if (!body.data.resolved?.users || !body.data.resolved?.members) continue;

                                    this._options.set(subSubOtion.name, Object.assign(body.data.resolved.users[subSubOtion.value], { member: body.data.resolved?.members[subSubOtion.value] }));
                                case ApplicationCommandOptionType.Channel:
                                    if (!body.data.resolved?.channels) continue;

                                    this._options.set(subSubOtion.name, body.data.resolved.channels[subSubOtion.value]);
                                case ApplicationCommandOptionType.Role:
                                    if (!body.data.resolved?.roles) return;

                                    this._options.set(subSubOtion.name, body.data.resolved.roles[subSubOtion.value]);
                                default:
                                    this._options.set(subSubOtion.name, subSubOtion.value);
                            }
                        }
                    }
            }
        }



        /* } else if (interactionData.type === 5) {
            interactionData.req.body.data.components.forEach((subSubOption: any) => {
                subSubOption.components.forEach((subSubSubOption: any) => {
                    if (subSubOption.type === 6) {
                        this._options.set(subSubSubOption.custom_id, Object.assign(interactionData.req.body.data.resolved.users[subSubSubOption.value], { member: interactionData.req.body.data.resolved?.members[subSubSubOption.value] }));
                    } else if (subSubOption.type === 7) {
                        this._options.set(subSubSubOption.custom_id, interactionData.req.body.data.resolved.channels[subSubSubOption.value])
                    } else if (subSubOption.type === 8) {
                        this._options.set(subSubSubOption.custom_id, interactionData.req.body.data.resolved.roles[subSubSubOption.value])
                    } else {
                        this._options.set(subSubSubOption.custom_id, subSubSubOption.value);
                    }
                });
            });
        } else if (interactionData.type === 3) {
            if (interactionData.req.body.data.component_type === 6) {
                interactionData.req.body.data.values.forEach((value: any) => {
                    this._options.set(value, interactionData.req.body.data.resolved.roles[value]);
                });
            }
        } */
    }
    get(name: string) {
        return this._options.get(name);
    }
    first() {
        return this._options.values().next().value;
    }
}