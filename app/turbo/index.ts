import { MongoClient } from "mongodb"
import Router from "find-my-way"
import turbo from "turbo-http"
import { Request, Response, read_body } from "./turbo"
import qs from "qs"

declare module "find-my-way" {
    type Handler = (
        req: Request,
        res: Response,
        params: { [k: string]: string | undefined },
        store?: any
    ) => void
    type HTTPMethod = "GET" | "POST"
    interface Config {
        ignoreTrailingSlash?: boolean
        allowUnsafeRegex?: boolean
        caseSensitive?: boolean
        maxParamLength?: number
        defaultRoute?(req: Request, res: Response): void
        onBadUrl?(path: string, req: Request, res: Response): void
        versioning?: {
            storage(): {
                get(version: String): Handler | null
                set(version: String, store: Handler): void
                del(version: String): void
                empty(): void
            }
            deriveVersion(req: Request, ctx?: any): String
        }
    }
    interface Instance {
        on(
            method: HTTPMethod | HTTPMethod[],
            path: string,
            handler: Handler
        ): void
        lookup(req: Request, res: Response, ctx?: any): void
    }
}

export class TurboServer {
    router: Router.Instance
    server: turbo.Server
    db: MongoClient
    constructor(opt: Router.Config, db: MongoClient) {
        this.router = Router(opt)
        this.server = turbo.createServer(async (_req, _res) => {
            // アクセスがあるたびここを通る
            const req = new Request(_req)
            const res = new Response(_res)
            return this.router.lookup(req, res)
        })
        this.db = db
    }
    get(url: string, handler: Router.Handler) {
        this.router.on("GET", url, async (req, res, params) => {
            res.setHeader("Content-Type", "application/json")
            try {
                const query = qs.parse(req.url.replace(/^.+\?/, ""), {
                    decoder: decodeURIComponent,
                })
                req.query = query
                const data = await handler(req, res, params)
                if (typeof data !== "object") {
                    throw new Error("handlerはオブジェクトを返す必要があります")
                }
                res.write(Buffer.from(JSON.stringify(data)))
            } catch (error) {
                console.error(error)
                res.write(
                    Buffer.from(
                        JSON.stringify({
                            ok: false,
                            error: error.toString(),
                            details: {
                                stack: error.stack.split("\n"),
                            },
                        })
                    )
                )
            }
            res.end()
        })
    }
    post(url: string, handler: Router.Handler) {
        this.router.on("POST", url, async (req, res, params) => {
            res.setHeader("Content-Type", "application/json") // サーバーの応答はjson
            try {
                const body = await read_body(req) // これは必ず一番最初に呼ぶ

                // IPアドレス等を使ってアクセス制限をする場合はここで行う
                const ip_address = req.headers["x-real-ip"]

                req.body = body
                const data = await handler(req, res, params)
                res.write(Buffer.from(JSON.stringify(data)))
            } catch (error) {
                console.error(error)
                res.write(
                    Buffer.from(
                        JSON.stringify({
                            ok: false,
                            error: error.toString(),
                            details: {
                                stack: error.stack.split("\n"),
                            },
                        })
                    )
                )
            }
            res.end()
        })
    }
    register(module: any, opt: any) {
        module(this, opt)
        return this
    }
    listen(port: number) {
        this.server.listen(port)
    }
}
