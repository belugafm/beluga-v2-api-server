declare module "turbo-http" {
    class Server {
        listen(port: number): void
    }
    class Request {
        method: string
        url: string
        _options: { [key: string]: any }
        _headers: string[]
        ondata: (buffer: Buffer, start: number, length: number) => void
        onend: () => void
    }
    class Response {
        server: Server
        statusCode: number
        headerSent: boolean
        _headers: string[]
        setHeader(name: string, value: string): void
        write(buf: Buffer, n?: number, cb?: number): void
        end(buf?: Buffer, n?: number, cb?: number): void
    }
    function createServer(
        handler: (req: Request, res: Response) => void
    ): Server
}
