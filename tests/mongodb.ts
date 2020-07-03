import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"

export async function connect(): Promise<MongoMemoryReplSet> {
    return new Promise(async (resolve, reject) => {
        const replSet = new MongoMemoryReplSet({
            replSet: { storageEngine: "wiredTiger" },
        })
        replSet.waitUntilRunning().then(() => {
            replSet.getUri().then(async (uri) => {
                mongoose.connect(uri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                })
                mongoose.connection.on("error", (e) => {
                    reject(e)
                })
                mongoose.connection.once("open", async () => {
                    resolve(replSet)
                })
            })
        })
    })
}
