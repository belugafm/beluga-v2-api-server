import { TurboServer, Request, Response } from "./web/turbo"
import { MongoClient } from "mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

function init(db: MongoClient | MongoMemoryServer) {
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
    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/account/signin"))
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
        console.log(uri)
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
