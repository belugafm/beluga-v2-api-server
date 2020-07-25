import { TurboServer } from "../../turbo"
import create, { facts } from "../../api/methods/blocks/create"
import mongoose from "mongoose"
import {
    WebApiRuntimeError,
    InternalErrorSpec,
    EndpointUnavailableErrorSpec,
} from "../../api/error"
import { get as get_user } from "../../../model/user/get"
import config from "../../../config/app"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        if (config.blocks.enabled === false) {
            throw new WebApiRuntimeError(new EndpointUnavailableErrorSpec())
        }
        const { auth_user } = params
        const user_id = mongoose.Types.ObjectId(req.body.user_id)
        await create(
            {
                user_id: user_id,
            },
            auth_user
        )
        const user = await get_user({ user_id }, { disable_cache: true })
        if (user == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        return {
            ok: true,
            user: await user.transform(auth_user, { disable_cache: true }),
        }
    })
}
