import { TurboServer } from "../../turbo"
import destroy, { facts } from "../../api/methods/channel/destroy"
import mongoose from "mongoose"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const { auth_user } = params
        await destroy(
            {
                channel_id: mongoose.Types.ObjectId(req.body.channel_id),
            },
            auth_user
        )
        return {
            ok: true,
        }
    })
}
