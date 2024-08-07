import { API, MessageFlags } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { Collection } from "@discordjs/collection";
import { EventEmitter } from "node:events";
import Polka from "polka";
import config from "./config.json" assert { type: "json" };
import { ChatInputCommand, ContextMenuCommand } from "./structures/index.js";

export default class App extends EventEmitter {
    public readonly config = config;
    public readonly server = Polka();
    public readonly chatInputCommands = new Collection<string, ChatInputCommand>();
    public readonly contextMenuCommands = new Collection<string, ContextMenuCommand<"message" | "user">>();
    public readonly api = new API(new REST().setToken(this.config.token));
    public ephemeral: undefined | MessageFlags.Ephemeral = MessageFlags.Ephemeral;

    public constructor() {
        super();
    }
};