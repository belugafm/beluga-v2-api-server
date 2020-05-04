import { MongoClient } from "mongodb"
export declare class TurboServer {
    constructor(opt: any, db: MongoClient)
    listen(port: number): void
}
export * from "./turbo"
