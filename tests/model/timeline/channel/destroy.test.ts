import { env, create_user, create_channel } from "../../../mongodb"
import { update } from "../../../../app/model/status/update"
import { channel as get_channel_statuses } from "../../../../app/model/timeline/channel"
import { destroy } from "../../../../app/model/status/destroy"
import { Status } from "../../../../app/schema/status"
import { document_cache } from "../../../../app/document/cache"

document_cache.disable()

jest.setTimeout(30000)

describe("timeline/channel", () => {
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
    test("destroy", async () => {
        const status = await update({
            text: "aaaaab",
            user_id: user._id,
            channel_id: channel._id,
        })
        expect(status).toBeInstanceOf(Status)
        {
            const statuses = await get_channel_statuses({
                channel_id: channel._id,
            })
            expect(statuses).toHaveLength(1)
            expect(statuses[0]).toBeInstanceOf(Status)
        }
        await destroy({
            status_id: status._id,
        })
        {
            const statuses = await get_channel_statuses({
                channel_id: channel._id,
            })
            expect(statuses).toHaveLength(0)
        }
        const statuses = []
        const repeats = 5
        for (let index = 0; index < repeats; index++) {
            statuses.push(
                await update({
                    text: "aaaaab",
                    user_id: user._id,
                    channel_id: channel._id,
                })
            )
        }
        {
            const statuses = await get_channel_statuses({
                channel_id: channel._id,
            })
            expect(statuses).toHaveLength(repeats)
        }
        for (let index = 0; index < repeats; index++) {
            const status = statuses[index]
            await destroy({
                status_id: status._id,
            })
            {
                const statuses = await get_channel_statuses({
                    channel_id: channel._id,
                })
                expect(statuses).toHaveLength(repeats - index - 1)
            }
        }
    })
})
