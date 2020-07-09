import { TurboServer } from "../../turbo"
import show, { facts } from "../../api/methods/channel/show"
import mongoose from "mongoose"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const { auth_user } = params
        const channel = await show(
            {
                channel_id: mongoose.Types.ObjectId(req.query.channel_id),
            },
            auth_user
        )
        return {
            ok: true,
            channel: channel ? await channel.transform() : null,
        }
    })
}
