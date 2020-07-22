import { TurboServer } from "../../../turbo"
import { authenticate_user_with_cookie } from "../../../auth"
import { facts } from "../../../api/methods/auth/cookie/authenticate"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const [user, session] = await authenticate_user_with_cookie(req.cookies)
        if (user == null) {
            return {
                ok: true,
                user: null,
                logged_out: true,
            }
        }
        return {
            ok: true,
            user: await user.transform(null),
            logged_out: false,
        }
    })
}
