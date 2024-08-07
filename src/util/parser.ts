import type { Next } from "polka";
import type { Request, Response } from "express";

export async function parser(req: Request, _: Response, next: Next) {
    if (!req.headers["content-type"]?.startsWith("application/json")) return next("Unexpected content type");

    req.setEncoding("utf8");
    
    try {
        let data = "";

        for await (const chunk of req) data += chunk;

        (req as any).rawBody = data;
        req.body = JSON.parse(data);
        
        return void next();
    } catch (error) {
        return next((error as Error).message);
    }
};