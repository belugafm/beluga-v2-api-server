import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

export async function connect(): Promise<MongoMemoryServer> {
    return new Promise(async (resolve, reject) => {
        const mongodb = new MongoMemoryServer()
        const uri = await mongodb.getUri()
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        mongoose.connection.on("error", (e) => {
            reject(e)
        })
        mongoose.connection.once("open", async () => {
            resolve(mongodb)
        })
    })
}
