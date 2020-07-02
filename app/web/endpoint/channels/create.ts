import { TurboServer } from "../../turbo"
import create, { facts } from "../../api/methods/channels/create"
import mongoose from "mongoose"
import {
    WebApiRuntimeError,
    InternalErrorSpec,
    InvalidAuth,
} from "../../api/error"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const { logged_in_user } = params
        if (logged_in_user == null) {
            throw new WebApiRuntimeError(new InvalidAuth())
        }
        const community_id = req.body.community_id
            ? mongoose.Types.ObjectId(req.body.community_id)
            : undefined
        const channel = await create({
            name: req.body.name,
            description: req.body.description,
            is_public: req.body.is_public,
            creator_id: logged_in_user._id,
            community_id: community_id,
        })
        if (channel == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        return {
            ok: true,
            channel: channel.transform(),
        }
    })
}
