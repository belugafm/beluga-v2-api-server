import { env, create_user, create_channel } from "../../../mongodb"
import { destroy, ErrorCodes } from "../../../../app/model/status/destroy"
import { update } from "../../../../app/model/status/update"
import { get } from "../../../../app/model/status/get"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import { Status } from "../../../../app/schema/status"
import { UserSchema } from "app/schema/user"
import { ChannelSchema } from "app/schema/channel"

config.status.text.max_length = 10
config.status.text.min_length = 5
jest.setTimeout(30000)

describe("status/destroy", () => {
    // @ts-ignore
    let user: UserSchema = null
    // @ts-ignore
    let channel: ChannelSchema = null

    beforeAll(async () => {
        await env.connect()
        user = await create_user()
        channel = await create_channel("channel", user._id)
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("ok", async () => {
        expect.assertions(1)
        const status = await update({
            text: "aaaaab",
            user_id: user._id,
            channel_id: channel._id,
        })
        await destroy({ status_id: status._id })
        const _status = await get(
            { status_id: status._id },
            {
                disable_in_memory_cache: true,
            }
        )
        expect(_status).toBeNull()
    })
})
