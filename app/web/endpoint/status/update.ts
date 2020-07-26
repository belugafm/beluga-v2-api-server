import { TurboServer } from "../../turbo"
import update, { facts } from "../../api/methods/status/update"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"
import * as mongo from "../../../lib/mongoose"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const { auth_user } = params
        const status = await update(
            {
                channel_id: mongo.toObjectId(req.body.channel_id),
                thread_status_id: mongo.toObjectId(req.body.thread_status_id),
                text: req.body.text,
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
