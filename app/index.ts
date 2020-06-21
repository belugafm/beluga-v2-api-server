import { TurboServer, Request, Response } from "./web/turbo"
import { MongoClient } from "mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import { facts } from "./web/api/methods/account/signup"
import signup from "./web/api/methods/account/signup"

function init(db: MongoClient | MongoMemoryServer) {
    console.log("接続しました")
    const server = new TurboServer(
        {
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
        },
        db
    )
    server.post(facts.url, async (req, res, params) => {
        await signup({
            name: req.body.name,
            password: req.body.password,
            confirmed_password: req.body.confirmed_password,
        })
        return {
            ok: true,
            message: "hoge page",
        }
    })
    server.listen(8080)
}

const mongodb = new MongoMemoryServer()
mongodb.getUri().then(async (uri) => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    mongoose.connection.on("error", (e) => {
        console.error(e)
    })
    mongoose.connection.once("open", async () => {
        init(mongodb)
    })
})

// 先にdocker-compose upしておく
if (false) {
    const uri = "mongodb://localhost:27017"
    MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then((mongodb) => {
            init(mongodb)
        })
        .catch((reason) => {
            console.log(reason)
        })
}
