import { TurboServer, Request, Response } from "../../turbo"
import signup, { facts } from "../../api/methods/account/signup"
import { StrictRule } from "../../../model/fraud_score/ok"

export default (server: TurboServer) => {
    server.post(
        facts.url,
        async (req: Request, res: Response, params: any) => {
            await signup({
                name: req.body.name,
                password: req.body.password,
                confirmed_password: req.body.confirmed_password,
                ip_address: params["ip_address"],
                fingerprint: req.body.fingerprint,
            })
            return {
                ok: true,
            }
        },
        {
            fraud_prevention_rule: StrictRule,
        }
    )
}
