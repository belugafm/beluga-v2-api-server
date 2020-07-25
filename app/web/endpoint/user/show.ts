import { TurboServer } from "../../turbo"
import show, { facts } from "../../api/methods/user/show"
import mongoose from "mongoose"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const { auth_user } = params
        const user = await show(
            {
                user_id: mongoose.Types.ObjectId(req.query.user_id),
                name: req.query.name,
            },
            auth_user
        )
        if (user == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        return {
            ok: true,
            user: await user.transform(auth_user),
        }
    })
}
