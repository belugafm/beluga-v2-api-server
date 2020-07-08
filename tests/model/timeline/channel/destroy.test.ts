import { env } from "../../../mongodb"
import { update } from "../../../../app/model/status/update"
import { channel as get_channel_statuses } from "../../../../app/model/timeline/channel"
import { destroy } from "../../../../app/model/status/destroy"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"
import { Status } from "../../../../app/schema/status"
import { in_memory_cache } from "../../../../app/lib/cache"

in_memory_cache.disable()

jest.setTimeout(30000)

describe("timeline/channel", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("destroy", async () => {
        const channel_id = mongoose.Types.ObjectId(ExampleObjectId)
        const status = await update({
            text: "aaaaab",
            user_id: mongoose.Types.ObjectId(ExampleObjectId),
            channel_id: channel_id,
            community_id: mongoose.Types.ObjectId(ExampleObjectId),
            is_public: true,
        })
        expect(status).toBeInstanceOf(Status)
        {
            const statuses = await get_channel_statuses({
                channel_id: channel_id,
            })
            expect(statuses).toHaveLength(1)
            expect(statuses[0]).toBeInstanceOf(Status)
        }
        await destroy({ status_id: status._id })
        {
            const statuses = await get_channel_statuses({
                channel_id: channel_id,
            })
            expect(statuses).toHaveLength(0)
        }
        const statuses = []
        const repeats = 5
        for (let index = 0; index < repeats; index++) {
            statuses.push(
                await update({
                    text: "aaaaab",
                    user_id: mongoose.Types.ObjectId(ExampleObjectId),
                    channel_id: channel_id,
                    community_id: mongoose.Types.ObjectId(ExampleObjectId),
                    is_public: true,
                })
            )
        }
        {
            const statuses = await get_channel_statuses({
                channel_id: channel_id,
            })
            expect(statuses).toHaveLength(repeats)
        }
        for (let index = 0; index < repeats; index++) {
            const status = statuses[index]
            await destroy({ status_id: status._id })
            {
                const statuses = await get_channel_statuses({
                    channel_id: channel_id,
                })
                expect(statuses).toHaveLength(repeats - index - 1)
            }
        }
    })
})
