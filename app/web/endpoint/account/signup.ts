import { TurboServer } from "../../turbo"
import signup, { facts } from "../../api/methods/account/signup"
import signin from "../../api/methods/account/signin"
import { StrictRule } from "../../../model/fraud_score/ok"
import config from "../../../config/app"
import { InternalErrorSpec, WebApiRuntimeError } from "../../api/error"

export default (server: TurboServer) => {
    server.post(
        facts,
        async (req, res, params) => {
            await signup({
                name: req.body.name,
                password: req.body.password,
                confirmed_password: req.body.confirmed_password,
                ip_address: params["ip_address"],
                fingerprint: req.body.fingerprint,
            })
            const result = await signin({
                name: req.body.name,
                password: req.body.password,
                ip_address: params["ip_address"],
                session_lifetime:
                    config.user_registration
                        .reclassify_inactive_as_dormant_period,
            })
            if (result == null) {
                throw new WebApiRuntimeError(new InternalErrorSpec())
            }
            const [user, session] = result
            res.setCookie("session_id", session.session_id, {
                expires: session.expire_date,
                domain: config.server.domain,
                path: "/",
                httpOnly: true,
            })
            res.setCookie("user_id", session.user_id.toString(), {
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
