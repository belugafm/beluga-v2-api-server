import { MongoClient } from "mongodb"
import Router from "find-my-way"
import turbo from "turbo-http"
import { Request, Response, read_body } from "./turbo"
import qs from "qs"

export { Request, Response }

const default_route = (req: Request, res: Response) => {
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
}
declare module "find-my-way" {
    type Handler = (
        req: Request,
        res: Response,
        params: { [k: string]: string | undefined },
        store?: any
    ) => object | string
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
    interface ShortHandRoute {
        (path: string, handler: Handler): void
        (path: string, handler: Handler, store: any): void
    }
    interface Instance {
        on(
            method: HTTPMethod | HTTPMethod[],
            path: string,
            handler: Handler
        ): void
        lookup(req: Request, res: Response, ctx?: any): void
        get: ShortHandRoute
        post: ShortHandRoute
        routes: string[]
    }
}

export const ContentType = {
    HTML: "text/html",
    JSON: "application/json",
}

function to_string_based_on_content_type(
    data: string | object,
    type: string | undefined
) {
    if (type === ContentType.JSON) {
        if (typeof data !== "object") {
            throw new Error("handlerはオブジェクトを返す必要があります")
        }
        return JSON.stringify(data)
    }
    if (type === ContentType.HTML) {
        if (typeof data !== "string") {
            throw new Error("handlerは文字列を返す必要があります")
        }
        return data
    }
    if (typeof data !== "object") {
        throw new Error("handlerはオブジェクトを返す必要があります")
    }
    return JSON.stringify(data)
}

function check_content_type(content_type?: string) {
    if (content_type) {
        const available_types = Object.values(ContentType)
        if (available_types.includes(content_type) === false) {
            let types_str = ""
            available_types.forEach((type) => {
                types_str += `'${type}',`
            })
            types_str = types_str.slice(0, types_str.length - 1)
            throw new Error(
                `content_typeは${types_str}のいずれかを指定してください`
            )
        }
    }
}

export class TurboServer {
    router: Router.Instance
    server: turbo.Server
    db: MongoClient
    constructor(opt: Router.Config, db: MongoClient) {
        if (!opt.defaultRoute) {
            opt.defaultRoute = default_route
        }
        this.router = Router(opt)
        this.server = turbo.createServer(async (_req, _res) => {
            // アクセスがあるたびここを通る
            const req = new Request(_req)
            const res = new Response(_res)
            return this.router.lookup(req, res)
        })
        this.db = db
    }
    get(url: string, handler: Router.Handler, content_type?: string) {
        this.router.get(
            url,
            async (req, res, params, store) => {
                const { content_type } = store
                check_content_type(content_type)
                res.setHeader("Content-Type", content_type)
                try {
                    const query = qs.parse(req.url.replace(/^.+\?/, ""), {
                        decoder: decodeURIComponent,
                    })
                    req.query = query
                    const data = await handler(req, res, params)
                    res.write(
                        Buffer.from(
                            to_string_based_on_content_type(data, content_type)
                        )
                    )
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
            },
            { content_type: content_type ? content_type : ContentType.JSON }
        )
    }
    post(url: string, handler: Router.Handler) {
        this.router.post(url, async (req, res, params) => {
            res.setHeader("Content-Type", "application/json") // サーバーの応答はjson
            try {
                const body = await read_body(req) // これは必ず一番最初に呼ぶ

                // IPアドレス等を使ってアクセス制限をする場合はここで行う
                const ip_address = req.headers["x-real-ip"]

                req.body = body
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
    register(module: any, opt: any) {
        module(this, opt)
        return this
    }
    listen(port: number) {
        this.server.listen(port)
    }
}
