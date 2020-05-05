interface FormData {
    filename?: string
    type?: string
    name: string
    data: Buffer
}

function parse(body_buffer: Buffer, boundary: string): FormData[] {
    let last_line = ""
    let content_disposition = ""
    let conent_type = undefined
    let state = 0
    let buffer = []
    const ret: FormData[] = []
    for (let k = 0; k < body_buffer.length; k++) {
        const byte = body_buffer[k]
        const prev_byte = k > 0 ? body_buffer[k - 1] : null
        const newline_detected =
            byte === 0x0a && prev_byte === 0x0d ? true : false
        const is_newline_char = byte === 0x0a || byte === 0x0d ? true : false
        if (is_newline_char === false) {
            last_line += String.fromCharCode(byte)
        }
        if (state === 0 && newline_detected) {
            if ("--" + boundary === last_line) {
                state = 1
            }
            last_line = ""
        } else if (state === 1 && newline_detected) {
            content_disposition = last_line
            // input typeがtextやpasswordのときは↓
            // Content-Disposition: form-data; name="hoge
            // input typeがfileのときは↓
            // Content-Disposition: orm-data; name="hoge"; filename="beluga.jpg"
            // のようになっている
            state = 2
            if (content_disposition.indexOf("filename") === -1) {
                state = 3
            }
            last_line = ""
        } else if (state === 2 && newline_detected) {
            conent_type = last_line
            state = 3
            last_line = ""
        } else if (state === 3 && newline_detected) {
            state = 4
            buffer = []
            last_line = ""
        } else if (state === 4) {
            if (last_line.length > boundary.length + 4) {
                last_line = ""
            }
            if (last_line === "--" + boundary) {
                // boundaryを除くデータを取得
                const body_length = buffer.length - last_line.length
                const bytes = buffer.slice(0, body_length - 1)
                const part = { content_disposition, conent_type, bytes }
                ret.push(process(part))
                buffer = []
                last_line = ""
                state = 5
                content_disposition = ""
                conent_type = undefined
            } else {
                buffer.push(byte)
            }
            if (newline_detected) {
                last_line = ""
            }
        } else if (state === 5) {
            if (newline_detected) {
                state = 1
            }
        }
    }
    return ret
}

function process(part: {
    content_disposition: string
    conent_type: string | undefined
    bytes: number[]
}): FormData {
    const content_disposition = part.content_disposition.split(";")
    // content_dispositionは以下のようになっている
    // [
    //   'Content-Disposition: form-data',
    //   ' name="hoge"',
    //   ' filename="beluga.jpg"'
    // ]
    console.log(content_disposition)
    console.log(part.conent_type)
    const name = content_disposition[1].split("=")[1].replace(/"/g, "") // 送信時のformのinputタグのname属性
    const data = new Buffer(part.bytes)
    const type = part.conent_type
        ? part.conent_type.split(":")[1].trim()
        : undefined
    const filename_field = content_disposition[2]
    if (filename_field) {
        const raw_filename = filename_field.split("=")[1]
        const filename = JSON.parse(raw_filename.trim())
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
