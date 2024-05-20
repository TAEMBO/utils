import type { Next } from "polka";
import type { Request, Response } from "express";
import { TextEncoder } from "node:util";
import { webcrypto } from "node:crypto";
import config from "../config.json" assert { type: "json" };
const { subtle } = webcrypto;
const encoder = new TextEncoder();

function hexToBinary(hex: string) {
    const buf = new Uint8Array(Math.ceil(hex.length / 2));
    
    for (let index = 0; index < buf.length; index++) {
        buf[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
    }
    
    return buf;
}

const key = await subtle.importKey("raw", hexToBinary(config.publicKey), "Ed25519", true, ["verify"]);

export async function verifyKey(req: Request, res: Response, next: Next) {
    if (!req.headers["x-signature-ed25519"]) return res.writeHead(401).end();
    
    const signature = req.headers["x-signature-ed25519"] as string;
    const timestamp = req.headers["x-signature-timestamp"] as string;

    if (!signature || !timestamp) return res.writeHead(401).end();

    const hexSignature = hexToBinary(signature);
    const encoded = encoder.encode(timestamp + (req as any).rawBody);
    const isValid = await subtle.verify("Ed25519", key, hexSignature, encoded);
    
    if (!isValid) return res.writeHead(401).end();

    return next();
}