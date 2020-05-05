import { TurboServer, Request, Response } from "../../app/web/turbo"
import { MongoClient } from "mongodb"

// 先にdocker-compose upしておく
const uri = "mongodb://localhost:27017"
MongoClient.connect(uri)
    .then((client) => {
        console.log("接続しました")
        const server = new TurboServer(
            {
                maxParamLength: 128,
                defaultRoute: (req: Request, res: Response) => {
                    res.setHeader("Content-Type", "application/json")
                    res.statusCode = 404
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
            client
        )
        server.get("/", async (req, res, params) => {
            return {
                ok: true,
                message: "index page",
            }
        })
        server.get("/hoge", async (req, res, params) => {
            return {
                ok: true,
                message: "hoge page",
            }
        })
        server.listen(8080)
    })
    .catch((reason) => {
        console.log(reason)
    })
