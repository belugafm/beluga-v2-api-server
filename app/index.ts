import { TurboServer, Request, Response } from "./web/turbo"
import { MongoClient } from "mongodb"
import { MongoMemoryServer, MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"

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
    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/account/signin"))
    server.register(require("./web/endpoint/channels/create"))
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
