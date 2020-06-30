import { TurboServer, Request, Response } from "../../turbo"
import signin, { facts } from "../../api/methods/account/signin"
import { StrictRule } from "../../../model/fraud_score/ok"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"
import config from "../../../config/app"

export default (server: TurboServer) => {
    server.post(
        facts,
        async (req: Request, res: Response, params: any) => {
            const result = await signin({
                name: req.body.name,
                password: req.body.password,
                ip_address: params["ip_address"],
                session_lifetime: config.user_login_session.lifetime,
            })
            if (result == null) {
                throw new WebApiRuntimeError(new InternalErrorSpec())
            }
            const [user, session] = result
            res.setCookie("session_id", session.session_id, {
                expires: session.expire_date.getTime(),
            })
            res.setCookie("user_id", session.user_id.toString(), {
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
