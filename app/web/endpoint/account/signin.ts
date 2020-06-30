import { TurboServer, Request, Response } from "../../turbo"
import signin, { facts } from "../../api/methods/account/signin"
import { StrictRule } from "../../../model/fraud_score/ok"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"

export default (server: TurboServer) => {
    server.post(
        facts,
        async (req: Request, res: Response, params: any) => {
            const result = await signin({
                name: req.body.name,
                password: req.body.password,
                ip_address: params["ip_address"],
            })
            if (result == null) {
                throw new WebApiRuntimeError(new InternalErrorSpec())
            }
            const [user, session] = result
            res.setCookie("session_id", session.session_id, {
                expires: session.expire_date.getTime(),
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
