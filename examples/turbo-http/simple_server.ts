import { TurboServer } from "../../app/turbo"
import { MongoClient } from "mongodb"

// 先にdocker-compose upしておく
const uri = "mongodb://localhost:27017"
MongoClient.connect(uri)
    .then((client) => {
        console.log("接続しました")
        const server = new TurboServer(
            {
                maxParamLength: 128,
                defaultRoute: (req: any, res: any) => {
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
        server.listen(8080)
    })
    .catch((reason) => {
        console.log(reason)
    })
