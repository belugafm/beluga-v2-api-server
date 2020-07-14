import { env, create_user, create_channel } from "../../../mongodb"
import { update } from "../../../../app/model/status/update"
import { get } from "../../../../app/model/status/get"
import { destroy } from "../../../../app/model/status/destroy"
import config from "../../../../app/config/app"
import { Status } from "../../../../app/schema/status"
import { in_memory_cache } from "../../../../app/lib/cache"

in_memory_cache.disable()

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
        const status = await update({
            text: "aaaaab",
            user_id: user._id,
            channel_id: channel._id,
        })
        expect(status).toBeInstanceOf(Status)
        {
            const _status = await get({
                status_id: status._id,
            })
            expect(_status).toBeInstanceOf(Status)
        }
        await destroy({
            status_id: status._id,
        })
        {
            const _status = await get({
                status_id: status._id,
            })
            expect(_status).toBeNull()
        }
    })
})
