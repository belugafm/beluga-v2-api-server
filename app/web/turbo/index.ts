import { MongoClient } from "mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"
import Router from "find-my-way"
import turbo from "turbo-http"
import { Request, Response, read_body } from "./turbo"
import qs from "qs"
import {
    WebApiRuntimeError,
    FraudPreventionAccessDeniedErrorSpec,
} from "../api/error"
import config from "../../config/app"
import * as fraud_prevention from "../../model/fraud_score/ok"

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

const base_url = "/api/v1/"

type Options = {
    fraud_prevention_rule?: fraud_prevention.FraudPreventionRule
}

export class TurboServer {
    router: Router.Instance
    server: turbo.Server
    db: MongoClient | MongoMemoryServer
    constructor(opt: Router.Config, db: MongoClient | MongoMemoryServer) {
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
            base_url + url,
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
            {
                content_type: content_type ? content_type : ContentType.JSON,
            }
        )
    }
    post(url: string, handler: Router.Handler, options: Options = {}) {
        this.router.post(base_url + url, async (req, res, params) => {
            res.setHeader("Content-Type", "application/json") // サーバーの応答はjson
            res.setStatusCode(200)
            try {
                const body = await read_body(req) // これは必ず一番最初に呼ぶ

                // IPアドレス等を使ってアクセス制限をする場合はここで行う
                const ip_address = req.headers["x-real-ip"]
                params["ip_address"] = ip_address
                if (config.fraud_prevention.enabled) {
                    const rule = options.fraud_prevention_rule
                        ? options.fraud_prevention_rule
                        : fraud_prevention.DefaultRule
                    if (
                        (await fraud_prevention.ok({
                            ip_address,
                            apply_rule: rule,
                        })) === true
                    ) {
                        console.log("OK")
                    } else {
                        throw new WebApiRuntimeError(
                            new FraudPreventionAccessDeniedErrorSpec()
                        )
                    }
                }

                req.body = body
                const data = await handler(req, res, params)
                if (typeof data !== "object") {
                    throw new Error("handlerはオブジェクトを返す必要があります")
                }
                res.write(Buffer.from(JSON.stringify(data)))
            } catch (error) {
                if (error instanceof WebApiRuntimeError) {
                    res.write(
                        Buffer.from(
                            JSON.stringify({
                                ok: false,
                                error_code: error.code,
                                description: error.description,
                                argument: error.argument,
                                hint: error.hint,
                                additional_message: error.additional_message,
                                stack: null,
                            })
                        )
                    )
                } else {
                    res.write(
                        Buffer.from(
                            JSON.stringify({
                                ok: false,
                                error_code: "unexpected_error",
                                description: [error.toString()],
                                stack: error.stack.split("\n"),
                            })
                        )
                    )
                }
                console.error(error)
            }
            res.end()
        })
    }
    register(module: any) {
        module.default(this)
        return this
    }
    listen(port: number) {
        this.server.listen(port)
    }
}
