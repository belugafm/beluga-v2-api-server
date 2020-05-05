import { TurboServer, ContentType } from "../../app/web/turbo"
import { MongoClient } from "mongodb"

// 先にdocker-compose upしておく
const uri = "mongodb://localhost:27017"
MongoClient.connect(uri)
    .then((client) => {
        console.log("接続しました")
        const server = new TurboServer({}, client)
        server.get(
            "/",
            async (req, res, params) => {
                return `<html>
    <body>
        <form action="/upload" method="POST">
            <input type="text" name="user_name" />
            <input type="password" name="password" />
            <input type="submit" value="登録" />
        </form>
    </body>
</html>`
            },
            ContentType.HTML
        )
        server.post("/upload", async (req, res, params) => {
            const { body } = req
            return {
                ok: true,
                user_name: body.user_name,
                password: body.password,
            }
        })
        console.log(server.router.routes)
        server.listen(8080)
    })
    .catch((reason) => {
        console.log(reason)
    })
