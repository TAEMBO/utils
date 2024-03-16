import {
    type APIApplicationCommandInteractionDataIntegerOption,
    type APIApplicationCommandInteractionDataNumberOption,
    type APIApplicationCommandInteractionDataOption,
    type APIApplicationCommandInteractionDataStringOption,
    type APIAttachment,
    type APIChannel,
    type APIGuildMember,
    type APIInteractionDataResolved,
    type APIMessage,
    type APIRole,
    type APIUser,
    ApplicationCommandOptionType,
    type ChannelType
} from "@discordjs/core/http-only";

/**
 * A resolver for command interaction options.
 */
export class OptionResolver {
    private _group: string | null;
    private _subcommand: string | null;
    private _hoistedOptions: any[];

    constructor(options: APIApplicationCommandInteractionDataOption[], resolved: APIInteractionDataResolved) {
        this._group = null;
        this._subcommand = null;
        this._hoistedOptions = options.map(option => this.transformOption(option, resolved));

        if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.SubcommandGroup) {
            this._group = this._hoistedOptions[0].name;
            this._hoistedOptions = this._hoistedOptions[0].options ?? [];
        }
        
        if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.Subcommand) {
            this._subcommand = this._hoistedOptions[0].name;
            this._hoistedOptions = this._hoistedOptions[0].options ?? [];
        }

        Object.defineProperty(this, 'data', { value: Object.freeze([...options]) });
        Object.defineProperty(this, 'resolved', { value: resolved ? Object.freeze(resolved) : null });
    }
  
    private get(name: string, required = false) {
        const option = this._hoistedOptions.find(opt => opt.name === name);
        
        if (!option) {
            if (required) {
                throw new Error(`Required option "${name}" not found`);
            }

            return null;
        }
        
        return option;
    }
        
    private _getTypedOption(name: string, allowedTypes: (number | string)[], properties: string[], required: boolean) {
        const option = this.get(name, required);
        
        if (!option) {
            return null;
        } else if (!allowedTypes.includes(option.type)) {
            throw new Error(`Option "${name}" is of type: ${option.type}; expected ${allowedTypes.join(", ")}`);
        } else if (required && properties.every(prop => option[prop] === null || option[prop] === undefined)) {
            throw new Error(`Required option "${name}" is of type: ${option.type}; expected a non-empty value.`);
        }

        return option;
    }

    private transformOption(option: Record<string, any>, resolved: APIInteractionDataResolved) {
        const result: Record<string, any> = {
            name: option.name,
            type: option.type,
        };
    
        if ('value' in option) result.value = option.value;
        if ('options' in option) result.options = option.options.map((opt: Record<string, any>) => this.transformOption(opt, resolved));
        
        if (resolved) {
            const user = resolved.users?.[option.value];
            
            if (user) result.user = user;
            
            const member = resolved.members?.[option.value];
            
            if (member) result.member = member;
            
            const channel = resolved.channels?.[option.value];
            
            if (channel) result.channel = channel;
            
            const role = resolved.roles?.[option.value];
            
            if (role) result.role = role;
            
            const attachment = resolved.attachments?.[option.value];
            
            if (attachment) result.attachment = attachment;
        }
    
        return result;
    }
  
    /**
     * Gets the selected subcommand.
     * @param required Whether to throw an error if there is no subcommand.
     * @returns The name of the selected subcommand, or null if not set and not required.
     */
    public getSubcommand(required = true) {
        if (required && !this._subcommand) {
            throw new Error("No subcommand specified for interaction.");
        }
        
        return this._subcommand;
    }
  
    /**
     * Gets the selected subcommand group.
     * @param required Whether to throw an error if there is no subcommand group.
     * @returns The name of the selected subcommand group, or null if not set and not required.
     */
    public getSubcommandGroup(required = false) {
        if (required && !this._group) {
            throw new Error("No subcommand group specified for interaction.");
        }
        
        return this._group;
    }
  
    /**
     * Gets a boolean option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns The value of the option, or null if not set and not required.
     */
    public getBoolean(name: string, required = false) {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.Boolean], ['value'], required);
        return option?.value ?? null;
    }
  
    /**
     * Gets a channel option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @param channelTypes The allowed types of channels. If empty, all channel types are allowed.
     * @returns 
     * The value of the option, or null if not set and not required.
     */
    public getChannel(name: string, required = false, channelTypes: ChannelType[] = []) {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.Channel], ['channel'], required);
        const channel: APIChannel = option?.channel ?? null;
        
        if (channel && channelTypes.length > 0 && !channelTypes.includes(channel.type)) {
            throw new Error(`The type of channel of the option "${name}" is: ${channel.type}; expected ${channelTypes.join(', ')}.`);
        }
        
        return channel;
    }
  
    /**
     * Gets a string option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns The value of the option, or null if not set and not required.
     */
    public getString(name: string, required = false) {
        const option: APIApplicationCommandInteractionDataStringOption = this._getTypedOption(name, [ApplicationCommandOptionType.String], ['value'], required);
        
        return option?.value ?? null;
    }
  
    /**
     * Gets an integer option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns The value of the option, or null if not set and not required.
     */
    public getInteger(name: string, required = false) {
        const option: APIApplicationCommandInteractionDataIntegerOption = this._getTypedOption(name, [ApplicationCommandOptionType.Integer], ['value'], required);
        
        return option?.value ?? null;
    }
  
    /**
     * Gets a number option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns The value of the option, or null if not set and not required.
     */
    public getNumber(name: string, required = false) {
        const option: APIApplicationCommandInteractionDataNumberOption = this._getTypedOption(name, [ApplicationCommandOptionType.Number], ['value'], required);
        
        return option?.value ?? null;
    }
  
    /**
     * Gets a user option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns The value of the option, or null if not set and not required.
     */
    public getUser(name: string, required = false) {
        const option: { user: APIUser } = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.User, ApplicationCommandOptionType.Mentionable],
            ['user'],
            required,
        );

        return option?.user ?? null;
    }
  
    /**
     * Gets a member option.
     * @param name The name of the option.
     * @returns 
     * The value of the option, or null if the user is not present in the guild or the option is not set.
     */
    public getMember(name: string) {
        const option: { member: APIGuildMember } = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.User, ApplicationCommandOptionType.Mentionable],
            ['member'],
            false,
        );
        
        return option?.member ?? null;
    }
  
    /**
     * Gets a role option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns The value of the option, or null if not set and not required.
     */
    public getRole(name: string, required = false) {
        const option: { role: APIRole } = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.Role, ApplicationCommandOptionType.Mentionable],
            ['role'],
            required,
        );
        
        return option?.role ?? null;
    }
  
    /**
     * Gets an attachment option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns The value of the option, or null if not set and not required.
     */
    public getAttachment(name: string, required = false) {
        const option: { attachment: APIAttachment } = this._getTypedOption(name, [ApplicationCommandOptionType.Attachment], ['attachment'], required);
        
        return option?.attachment ?? null;
    }
  
    /**
     * Gets a mentionable option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns 
     * The value of the option, or null if not set and not required.
     */
    public getMentionable(name: string, required = false) {
        const option = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.Mentionable],
            ['user', 'member', 'role'],
            required,
        );
        
        return option?.member ?? option?.user ?? option?.role ?? null;
    }
  
    /**
     * Gets a message option.
     * @param name The name of the option.
     * @param required Whether to throw an error if the option is not found.
     * @returns 
     * The value of the option, or null if not set and not required.
     */
    public getMessage(name: string, required = false) {
        const option: { message: APIMessage } = this._getTypedOption(name, ['_MESSAGE'], ['message'], required);
        
        return option?.message ?? null;
    }
  
    /**
     * Gets the focused option.
     * @param getFull Whether to get the full option object
     * @returns 
     * The value of the option, or the whole option if getFull is true
     */
    public getFocused(getFull = false) {
        const focusedOption = this._hoistedOptions.find(option => option.focused);
        
        if (!focusedOption) throw new Error("No focused option for autocomplete interaction.");
        
        return getFull ? focusedOption : focusedOption.value;
    }
  }