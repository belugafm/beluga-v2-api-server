import { TurboServer } from "../../turbo"
import show, { facts } from "../../api/methods/status/show"
import mongoose from "mongoose"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const { auth_user } = params
        const status = await show(
            {
                status_id: mongoose.Types.ObjectId(req.body.status_id),
            },
            auth_user
        )
        if (status == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        return {
            ok: true,
            status: await status.transform(auth_user),
        }
    })
}
