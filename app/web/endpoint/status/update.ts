import { TurboServer } from "../../turbo"
import update, { facts } from "../../api/methods/status/update"
import mongoose from "mongoose"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const { auth_user } = params
        const status = await update(
            {
                channel_id: mongoose.Types.ObjectId(req.body.channel_id),
                text: req.body.text,
            },
            auth_user
        )
        if (status == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        return {
            ok: true,
            status: await status.transform(),
        }
    })
}
