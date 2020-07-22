import { TurboServer } from "../../turbo"
import signin, { facts } from "../../api/methods/account/signin"
import { StrictRule } from "../../../model/fraud_score/ok"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"
import config from "../../../config/app"
import { invalidate_last_login_session } from "../../auth"
import { update_last_activity_date } from "../../../model/user/update_last_activity_date"

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
            if (user == null) {
                throw new WebApiRuntimeError(new InternalErrorSpec())
            }
            if (session == null) {
                throw new WebApiRuntimeError(new InternalErrorSpec())
            }
            if (user.active !== true) {
                user.active = true
                await user.save()
            }
            await update_last_activity_date({
                user_id: user._id,
                date: new Date(),
            })
            res.setCookie("user_id", session.user_id.toHexString(), {
                expires: session.expire_date,
                domain: config.server.domain,
                path: "/",
                httpOnly: true,
            })
            res.setCookie("session_id", session._id.toHexString(), {
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
