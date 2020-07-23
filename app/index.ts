import { TurboServer, Request, Response } from "./web/turbo"
import { MongoClient } from "mongodb"
import { MongoMemoryServer, MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import { User } from "./schema/user"
import { UserLoginCredential } from "./schema/user_login_credential"
import { UserRegistration } from "./schema/user_registration"
import { FraudScore } from "./schema/fraud_score"
import { Channel } from "./schema/channel"
import { Status } from "./schema/status"
import config from "./config/app"
import { document_cache } from "./document/cache"
import { status_object_cache } from "./object/types/status"
import { user_object_cache } from "./object/types/user"
import { StatusFavorites } from "./schema/status_favorites"
import { StatusLikes } from "./schema/status_likes"
import { UserMutes } from "./schema/user_mutes"
import { UserBlocks } from "./schema/user_blocks"
import signup from "./web/api/methods/account/signup"

async function create_collections() {
    try {
        await User.createCollection()
    } catch (error) {}
    try {
        await UserLoginCredential.createCollection()
    } catch (error) {}
    try {
        await UserRegistration.createCollection()
    } catch (error) {}
    try {
        await FraudScore.createCollection()
    } catch (error) {}
    try {
        await Channel.createCollection()
    } catch (error) {}
    try {
        await Status.createCollection()
    } catch (error) {}
    try {
        await StatusFavorites.createCollection()
    } catch (error) {}
    try {
        await StatusLikes.createCollection()
    } catch (error) {}
    try {
        await UserMutes.createCollection()
    } catch (error) {}
    try {
        await UserBlocks.createCollection()
    } catch (error) {}
}

async function start_server() {
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
    await create_collections()

    // change streamの登録
    document_cache.on()
    status_object_cache.on()
    user_object_cache.on()

    // routerにendpointを登録
    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/account/signin"))
    server.register(require("./web/endpoint/channel/create"))
    server.register(require("./web/endpoint/channel/destroy"))
    server.register(require("./web/endpoint/channel/show"))
    server.register(require("./web/endpoint/status/update"))
    server.register(require("./web/endpoint/status/destroy"))
    server.register(require("./web/endpoint/likes/create"))
    server.register(require("./web/endpoint/favorites/create"))
    server.register(require("./web/endpoint/favorites/destroy"))
    server.register(require("./web/endpoint/mutes/create"))
    server.register(require("./web/endpoint/mutes/destroy"))
    server.register(require("./web/endpoint/blocks/create"))
    server.register(require("./web/endpoint/blocks/destroy"))
    server.register(require("./web/endpoint/timeline/channel"))
    server.register(require("./web/endpoint/auth/cookie/authenticate"))

    server.listen(config.server.port)
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

                // change streamでwatchしている数よりも
                // 大きい値に設定する必要がある
                poolSize: 20,
            })
            mongoose.connection.on("error", (e) => {
                console.error(e)
            })
            mongoose.connection.once("open", async () => {
                await start_server()
                console.log(uri)
                await signup({
                    name: config.admin.name,
                    password: config.admin.password,
                    confirmed_password: config.admin.password,
                    ip_address: "0.0.0.0",
                })
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
