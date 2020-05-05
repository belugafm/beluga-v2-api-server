declare module "find-my-way" {
    // 公式のindex.d.tsを無視するため空のdeclareを作る
    function Router(config?: Config): Instance
    namespace Router {}
    export = Router
}
