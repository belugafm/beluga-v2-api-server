import { TurboServer, Request, Response } from "./web/turbo"
import { MongoClient } from "mongodb"
import { MongoMemoryServer, MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import { User } from "./schema/user"
import { UserLoginCredential } from "./schema/user_login_credentials"
import { UserRegistration } from "./schema/user_registration"
import { FraudScore } from "./schema/fraud_score"
import { Channel } from "./schema/channel"
import { Status } from "./schema/status"

function start_server() {
    const server = new TurboServer({
        maxParamLength: 128,
        defaultRoute: (req: Request, res: Response) => {
            res.setHeader("Content-Type", "application/json")
            res.setStatusCode(404)
            res.write(
                Buffer.from(
                    JSON.stringify({
                        ok: false,
                        error: "endpoint_not_found",
                    })
                )
            )
            res.end()
        },
    })

    // トランザクション中はcollectionの作成ができないので先に作っておく
    await User.createCollection()
    await UserLoginCredential.createCollection()
    await UserRegistration.createCollection()
    await FraudScore.createCollection()
    await Channel.createCollection()
    await Status.createCollection()

    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/account/signin"))
    server.register(require("./web/endpoint/channel/create"))
    server.register(require("./web/endpoint/channel/destroy"))
    server.register(require("./web/endpoint/status/update"))
    server.register(require("./web/endpoint/timeline/channel"))
    server.register(require("./web/endpoint/auth/cookie/authenticate"))
    server.listen(8080)
}

if (true) {
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
                console.error(e)
            })
            mongoose.connection.once("open", async () => {
                start_server()
                console.log(uri)
            })
        })
    })
} else {
    // 先にdocker-compose upしておく
    const uri = "mongodb://localhost:27017"
    MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then((mongodb) => {
            start_server()
        })
        .catch((reason) => {
            console.log(reason)
        })
}
