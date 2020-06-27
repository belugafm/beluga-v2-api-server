import { TurboServer } from "../../turbo"
import signup, { facts } from "../../api/methods/account/signup"

export default (server: TurboServer) => {
    server.post(facts.url, async (req, res, params) => {
        await signup({
            name: req.body.name,
            password: req.body.password,
            confirmed_password: req.body.confirmed_password,
        })
        return {
            ok: true,
            message: "hoge page",
        }
    })
}
