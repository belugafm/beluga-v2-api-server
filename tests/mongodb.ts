import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import { User } from "../app/schema/user"
import { UserLoginCredential } from "../app/schema/user_login_credentials"
import { UserRegistration } from "../app/schema/user_registration"
import { FraudScore } from "../app/schema/fraud_score"
import { Channel } from "../app/schema/channel"
import { Status } from "../app/schema/status"

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
                    // トランザクション中はcollectionの作成ができない
                    await User.createCollection()
                    await UserLoginCredential.createCollection()
                    await UserRegistration.createCollection()
                    await FraudScore.createCollection()
                    await Channel.createCollection()
                    await Status.createCollection()

                    resolve(replSet)
                })
                mongoose.connection.once("close", async () => {
                    User.watch().removeAllListeners()
                    UserLoginCredential.watch().removeAllListeners()
                    UserRegistration.watch().removeAllListeners()
                    FraudScore.watch().removeAllListeners()
                    Channel.watch().removeAllListeners()
                    Status.watch().removeAllListeners()
                })
            })
        })
    })
}
