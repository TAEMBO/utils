import { APIRole, APIUser, ApplicationCommandOptionType, APIInteractionDataResolvedChannelBase, ChannelType } from "discord-api-types/v10";
import { Collection } from "@discordjs/collection";

export class ChatInputCommandInteractionOptions {
    public subcommand: string | null = null;
    public group: string | null = null;
    private _options = new Collection<string, string | number | boolean | APIRole | APIUser | APIInteractionDataResolvedChannelBase<ChannelType>>();
    
    constructor(public data: any) {
        if (!data.data.options) return;

        for (const option of data.data.options) {
            switch (option.type) {
                case ApplicationCommandOptionType.Subcommand:
                    const subCmd = option;

                    this.subcommand = subCmd.name;

                    if (!subCmd.options) break;

                    for (const subCmdOption of subCmd.options) {
                        switch (subCmdOption.type) {
                            case ApplicationCommandOptionType.User: 
                                if (!data.data.resolved?.users || !data.data.resolved?.members) continue;

                                this._options.set(subCmdOption.name, Object.assign(data.data.resolved.users[subCmdOption.value], { member: data.data.resolved?.members[subCmdOption.value] }));
                            case ApplicationCommandOptionType.Channel:
                                if (!data.data.resolved?.channels) continue;

                                this._options.set(subCmdOption.name, data.data.resolved.channels[subCmdOption.value]);
                            case ApplicationCommandOptionType.Role:
                                if (!data.data.resolved?.roles) continue;

                                this._options.set(subCmdOption.name, data.data.resolved.roles[subCmdOption.value]);
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
                                    if (!data.data.resolved?.users || !data.data.resolved?.members) continue;

                                    this._options.set(subSubOtion.name, Object.assign(data.data.resolved.users[subSubOtion.value], { member: data.data.resolved?.members[subSubOtion.value] }));
                                case ApplicationCommandOptionType.Channel:
                                    if (!data.data.resolved?.channels) continue;

                                    this._options.set(subSubOtion.name, data.data.resolved.channels[subSubOtion.value]);
                                case ApplicationCommandOptionType.Role:
                                    if (!data.data.resolved?.roles) return;

                                    this._options.set(subSubOtion.name, data.data.resolved.roles[subSubOtion.value]);
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

        console.log(this._options);
    }

    get(name: string) {
        return this._options.get(name);
    }

    getString(name: string) {
        return this._options.find((value, key) => typeof value === 'string' && key === name) as string | undefined ?? null;
    }

    getBoolean(name: string) {
        return this._options.find((value, key) => typeof value === 'string' && key === name) as string | undefined ?? null;
    }

    first() {
        return this._options.values().next().value;
    }
}