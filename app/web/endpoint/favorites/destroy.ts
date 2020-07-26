import { TurboServer } from "../../turbo"
import destroy, { facts } from "../../api/methods/favorites/destroy"
import mongoose from "mongoose"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"
import { get as get_status } from "../../../model/status/get"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const { auth_user } = params
        const status_id = mongoose.Types.ObjectId(req.body.status_id)
        await destroy(
            {
                status_id: status_id,
            },
            auth_user
        )
        const status = await get_status({ status_id }, { disable_cache: true })
        if (status == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        return {
            ok: true,
            status: await status.transform(auth_user, {
                disable_cache: true,
                transform_entities: true,
            }),
        }
    })
}
