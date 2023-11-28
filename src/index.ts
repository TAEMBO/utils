import Client from './client.js';
import config from './config.json' assert { type: "json" };
import * as d_types from 'discord-api-types/v10';

d_types.Routes

config
const client = new Client({ ...config, port: 5600, hostname: "0.0.0.0" });

process.on("uncaughtException", console.log);