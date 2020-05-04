const qs = require("qs")
const cookie = require("cookie")
const turbo = require("turbo-http")
const multipart = require("./multipart")

const read_body = (req) =>
    new Promise((resolve, reject) => {
        const headers = req.headers ? req.headers : {}
        const parts = []
        req.add_event_handler("ondata", (buffer, start, length) => {
            const part = buffer.slice(start, start + length)
            const ret = new Buffer(length)
            part.copy(ret, 0, 0, length)
            parts.push(ret)
        })
        req.add_event_handler("onend", () => {
            try {
                const buffer = Buffer.concat(parts)
                const content_type = headers["content-type"]
                if (content_type === "application/json") {
                    resolve(JSON.parse(buffer.toString()))
                }
                if (content_type.indexOf("multipart/form-data") === 0) {
                    const boundary = content_type.split("boundary=")[1]
                    const items = multipart.parse(buffer, boundary)
                    const ret = {}
                    items.forEach((item) => {
                        if (item.filename) {
                            ret[item.name] = item.data
                            return
                        }
                        ret[item.name] = item.data.toString()
                    })
                    resolve(ret)
                }
                reject(new Error("invalid_request_data"))
            } catch (error) {
                console.error(error)
                reject(new Error("invalid_request_data"))
            }
        })
    })

const convert_raw_headers_to_dict = (raw_headers) => {
    const num = parseInt(raw_headers.length / 2)
    const headers = {}
    for (let k = 0; k < num; k++) {
        const key = raw_headers[k * 2].toLowerCase()
        const value = raw_headers[k * 2 + 1]
        headers[key] = value
    }
    return headers
}

function set_cookie(name, value, options) {
    const opts = Object.assign({}, options || {})
    if (opts.expires && Number.isInteger(opts.expires)) {
        opts.expires = new Date(opts.expires)
    }
    const serialized = cookie.serialize(name, value, opts)

    let setCookie = this.res.getHeader("Set-Cookie")
    if (!!setCookie === false) {
        this.header("Set-Cookie", serialized)
        this.res.setHeader("Set-Cookie", serialized)
        return this
    }

    if (typeof setCookie === "string") {
        setCookie = [setCookie]
    }

    setCookie.push(serialized)
    this.header("Set-Cookie", setCookie)
    this.res.setHeader("Set-Cookie", serialized)
    return this
}

class Request {
    constructor(raw_req) {
        this.raw_req = raw_req
        Object.keys(raw_req).forEach((key) => {
            this[key] = raw_req[key]
        })
        this.headers = convert_raw_headers_to_dict(raw_req._options.headers)
        this.cookies = this.headers.cookie
            ? cookie.parse(this.headers.cookie)
            : {}
    }
    add_event_handler(event_name, handler) {
        this.raw_req[event_name] = handler
    }
}

class Responce {
    constructor(raw_res) {
        Object.keys(raw_res).forEach((key) => {
            this[key] = raw_res[key]
        })
        this.raw_res = raw_res
    }
    end() {
        this.raw_res.end()
    }
    write(buf) {
        this.raw_res.write(buf)
    }
    setHeader(name, value) {
        this.raw_res.setHeader(name, value)
    }
    setCookie(name, value, opt) {
        opt = opt || {}
        if (opt.expires && Number.isInteger(opt.expires)) {
            opt.expires = new Date(opt.expires)
        }
        const cookie_str = cookie.serialize(name, value, opt)
        this.setHeader("Set-Cookie", cookie_str)
    }
}

const make_stack_array = (stack_str) => {
    components = stack_str.split("\n")
    return components
}

class TurboServer {
    constructor(opt, db) {
        this.router = require("find-my-way")(opt)
        this.server = turbo.createServer(async (req, res) => {
            req = new Request(req)
            res = new Responce(res)
            return this.router.lookup(req, res)
        })
        this.mongodb = db
    }
    get(url, handler) {
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
                                stack: make_stack_array(error.stack),
                            },
                        })
                    )
                )
            }
            res.end()
        })
    }
    post(url, handler) {
        this.router.on("POST", url, async (req, res, params) => {
            res.setHeader("Content-Type", "application/json")
            try {
                const body = await read_body(req) // これは必ず一番最初に呼ぶ
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
                                stack: make_stack_array(error.stack),
                            },
                        })
                    )
                )
            }
            res.end()
        })
    }
    register(module, opt) {
        module(this, opt)
        return this
    }
    listen(port) {
        this.server.listen(port)
    }
}

export { TurboServer }
