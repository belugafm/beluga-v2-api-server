import { TurboServer } from "../../turbo"
import get_channel_statuses, { facts } from "../../api/methods/timeline/channel"
import mongoose from "mongoose"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const { auth_user } = params
        const statuses = await get_channel_statuses(
            {
                channel_id: mongoose.Types.ObjectId(req.query.channel_id),
            },
            auth_user
        )
        return {
            ok: true,
            statuses: await Promise.all(
                statuses.map(async (status) => await status.transform())
            ),
        }
    })
}
