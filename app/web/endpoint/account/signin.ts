import { TurboServer } from "../../turbo"
import signin, { facts } from "../../api/methods/account/signin"
import { StrictRule } from "../../../model/fraud_score/ok"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"
import config from "../../../config/app"
import { invalidate_last_login_session } from "../../auth"

export default (server: TurboServer) => {
    server.post(
        facts,
        async (req, res, params) => {
            await invalidate_last_login_session(req.cookies)
            const [user, session] = await signin({
                name: req.body.name,
                password: req.body.password,
                ip_address: params["ip_address"],
                session_lifetime: config.user_login_session.lifetime,
            })
            if (session == null) {
                throw new WebApiRuntimeError(new InternalErrorSpec())
            }
            res.setCookie("user_id", session.user_id.toString(), {
                expires: session.expire_date,
                domain: config.server.domain,
                path: "/",
                httpOnly: true,
            })
            res.setCookie("session_id", session._id.toString(), {
                expires: session.expire_date,
                domain: config.server.domain,
                path: "/",
                httpOnly: true,
            })
            res.setCookie("session_token", session.session_token, {
                expires: session.expire_date,
                domain: config.server.domain,
                path: "/",
                httpOnly: true,
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
