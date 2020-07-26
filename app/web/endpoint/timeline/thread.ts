import { TurboServer } from "../../turbo"
import get_thread_statuses, { facts } from "../../api/methods/timeline/thread"
import mongoose from "mongoose"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const { auth_user } = params
        const statuses = await get_thread_statuses(
            {
                status_id: mongoose.Types.ObjectId(req.query.status_id),
            },
            auth_user
        )
        return {
            ok: true,
            statuses: await Promise.all(
                statuses.map(
                    async (status) => await status.transform(auth_user)
                )
            ),
        }
    })
}
