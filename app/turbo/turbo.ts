import turbo from "turbo-http"
import cookie from "cookie"
import multipart from "./multipart"

export class Request {
    _req: turbo.Request
    headers: { [key: string]: string }
    cookies: {}
    url: string = ""
    query: any = null
    body: any
    constructor(req: turbo.Request) {
        this._req = req
        Object.assign(this, req)
        this.headers = convert_raw_headers_to_dict(req._options.headers)
        this.cookies = this.headers["cookie"]
            ? cookie.parse(this.headers["cookie"])
            : {}
    }
    onData(handler: (buffer: Buffer, start: number, length: number) => void) {
        this._req.ondata = handler
    }
    onEnd(handler: () => void) {
        this._req.onend = handler
    }
}

export class Response {
    _res: turbo.Response
    statusCode: number = -1
    constructor(res: turbo.Response) {
        Object.assign(this, res)
        this._res = res
    }
    end() {
        this._res.end()
    }
    write(buf: Buffer) {
        this._res.write(buf)
    }
    setHeader(name: string, value: string) {
        this._res.setHeader(name, value)
    }
    setCookie(name: string, value: string, opt: { [key: string]: any }) {
        opt = opt || {}
        if (opt.expires && Number.isInteger(opt.expires)) {
            opt.expires = new Date(opt.expires)
        }
        const cookie_str = cookie.serialize(name, value, opt)
        this.setHeader("Set-Cookie", cookie_str)
    }
}

export function read_body(req: Request) {
    return new Promise((resolve, reject) => {
        const headers = req.headers ? req.headers : {}
        console.log(headers)
        const chunks: Buffer[] = []
        req.onData((buffer, start, length) => {
            const body_chunk = buffer.slice(start, start + length)
            const data = new Buffer(length)
            body_chunk.copy(data, 0, 0, length)
            chunks.push(data)
        })
        req.onEnd(() => {
            try {
                const data = Buffer.concat(chunks)
                const content_type = headers["content-type"]
                console.log(content_type)
                if (content_type === "application/json") {
                    return resolve(JSON.parse(data.toString()))
                }
                // multipart/form-dataの場合ヘッダは
                // Content-Type: multipart/form-data; boundary=----XXXXXXXXXXXXX
                // のようになるため前方一致で判別する
                // XXXXXXXXXXXXXの部分がboundary
                if (content_type.indexOf("multipart/form-data;") === 0) {
                    const boundary = content_type.split("boundary=")[1]
                    const items = multipart.parse(data, boundary)
                    const ret: { [key: string]: Buffer[] | string } = {}
                    console.log(items)
                    items.forEach((item) => {
                        if (item.filename) {
                            const list = ret[item.name]
                            // ファイルアップロードの場合バイナリデータを直接格納
                            if (Array.isArray(list)) {
                                list.push(item.data)
                            } else {
                                ret[item.name] = [item.data]
                            }
                        } else {
                            ret[item.name] = item.data.toString()
                        }
                    })
                    return resolve(ret)
                }
                if (content_type === "application/x-www-form-urlencoded") {
                    reject(
                        new Error(
                            "Contenty-Typeが'application/x-www-form-urlencoded'になっています。フォームのデータを送信する場合はenctypeを'multipart/form-data'にしてください。"
                        )
                    )
                }
                reject(new Error("Content-Typeが不正です"))
            } catch (error) {
                console.error(error)
                reject(new Error(error.toString()))
            }
        })
    })
}

function convert_raw_headers_to_dict(header_strings: string[]) {
    // raw_headersの中身はこういう形になっている
    // [
    //     "Host",
    //     "localhost:8080",
    //     "Connection",
    //     "keep-alive",
    //     "Pragma",
    //     "no-cache",
    //     "Cache-Control",
    //     "no-cache"
    // ]
    const num = Math.ceil(header_strings.length / 2) // 実際の要素の数は半分
    const headers: { [key: string]: string } = {}
    for (let k = 0; k < num; k++) {
        const key = header_strings[k * 2].toLowerCase() // 小文字に統一しておく
        const value = header_strings[k * 2 + 1]
        headers[key] = value
    }
    return headers
}
