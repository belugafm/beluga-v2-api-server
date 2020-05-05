interface FormData {
    filename?: string
    type?: string
    name: string
    data: Buffer
}

function parse(body_buffer: Buffer, boundary: string): FormData[] {
    let lastline = ""
    let header = ""
    let info = ""
    let state = 0
    let buffer = []
    const ret: FormData[] = []
    for (let k = 0; k < body_buffer.length; k++) {
        const byte = body_buffer[k]
        const prev_byte = k > 0 ? body_buffer[k - 1] : null
        const newline_detected =
            byte === 0x0a && prev_byte === 0x0d ? true : false
        const newline_char = byte === 0x0a || byte === 0x0d ? true : false
        if (newline_char === false) {
            lastline += String.fromCharCode(byte)
        }
        if (0 === state && newline_detected) {
            if ("--" + boundary === lastline) {
                state = 1
            }
            lastline = ""
        } else if (1 === state && newline_detected) {
            header = lastline
            state = 2
            if (header.indexOf("filename") === -1) {
                state = 3
            }
            lastline = ""
        } else if (2 === state && newline_detected) {
            info = lastline
            state = 3
            lastline = ""
        } else if (3 === state && newline_detected) {
            state = 4
            buffer = []
            lastline = ""
        } else if (4 === state) {
            if (lastline.length > boundary.length + 4) lastline = "" // mem save
            if ("--" + boundary === lastline) {
                const j = buffer.length - lastline.length
                const part = buffer.slice(0, j - 1)
                const p = { header, info, part }
                ret.push(process(p))
                buffer = []
                lastline = ""
                state = 5
                header = ""
                info = ""
            } else {
                buffer.push(byte)
            }
            if (newline_detected) lastline = ""
        } else if (5 === state) {
            if (newline_detected) state = 1
        }
    }
    return ret
}

function process(part: {
    header: string
    info: string
    part: number[]
}): FormData {
    const obj = function (str: string) {
        const k = str.split("=")
        const a = k[0].trim()
        const b = JSON.parse(k[1].trim())
        const o = {}
        Object.defineProperty(o, a, {
            value: b,
            writable: true,
            enumerable: true,
            configurable: true,
        })
        return o
    }
    const header = part.header.split(";")
    const name = header[1].split("=")[1].replace(/"/g, "")
    const filename_data = header[2]
    const data = new Buffer(part.part)
    const type = part.info.split(":")[1].trim()
    if (filename_data) {
        const k = filename_data.split("=")
        const a = k[0].trim()
        console.log(a)
        const filename = JSON.parse(k[1].trim())
        return {
            name,
            filename,
            type,
            data,
        }
    } else {
        return {
            name,
            type,
            data,
        }
    }
}

export default { parse }
