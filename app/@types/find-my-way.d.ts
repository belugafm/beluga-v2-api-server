declare module "find-my-way" {
    // 公式のindex.d.tsを無視するため空のdeclareを作る
    type Config = {}
    type Instance = {
        on(method: any, path: any, handler: any): void
        lookup(req: any, res: any, ctx?: any): void
        get: any
        post: any
        routes: any
    }

    function Router(config?: Config): Instance
    namespace Router {}
    export = Router
}
