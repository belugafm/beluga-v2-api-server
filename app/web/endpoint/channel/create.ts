import { TurboServer } from "../../turbo"
import create, { facts } from "../../api/methods/channel/create"
import mongoose from "mongoose"
import { WebApiRuntimeError, InternalErrorSpec } from "../../api/error"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const { auth_user } = params
        const community_id = req.body.community_id
            ? mongoose.Types.ObjectId(req.body.community_id)
            : null
        const channel = await create(
            {
                name: req.body.name,
                description: req.body.description,
                is_public: req.body.is_public,
                community_id: community_id,
            },
            auth_user
        )
        if (channel == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        return {
            ok: true,
            channel: await channel.transform(auth_user),
        }
    })
}
