import { env, sleep, create_user, create_channel } from "../../mongodb"
import { create } from "../../../app/model/status/likes/create"
import { update as update_status } from "../../../app/model/status/update"
import { get as get_status } from "../../../app/model/status/get"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../app/web/api/define"
import { StatusSchema } from "../../../app/schema/status"
import { StatusObject } from "../../../app/object/schema"

jest.setTimeout(30000)

describe("StatusObject", () => {
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
    test("likes", async () => {
        const user_1 = await create_user("user_1")
        const user_2 = await create_user("user_2")

        const status = await update_status({
            text: "Hell Word",
            user_id: user_1._id,
            channel_id: channel._id,
        })
        const likes_count = 5
        for (let n = 1; n <= likes_count; n++) {
            await create({
                status_id: status._id,
                user_id: user_2._id,
            })
        }
        {
            const _status = (await get_status({
                status_id: status._id,
            })) as StatusSchema
            const status_object = (await _status.transform(
                user
            )) as StatusObject
            expect(status_object.likes.count).toEqual(likes_count)
            expect(status_object.likes.counts).toHaveLength(1)
        }
    })
})
