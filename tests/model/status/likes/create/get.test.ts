import { env, create_user, create_channel } from "../../../../mongodb"
import { create } from "../../../../../app/model/status/likes/create"
import { get } from "../../../../../app/model/status/likes/get"
import { update as update_status } from "../../../../../app/model/status/update"
import { get as get_status } from "../../../../../app/model/status/get"
import { Status, StatusSchema } from "../../../../../app/schema/status"
import {
    StatusLikes,
    StatusLikesSchema,
} from "../../../../../app/schema/status_likes"

jest.setTimeout(30000)

describe("status/likes/get", () => {
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
    test("get", async () => {
        const user_1 = await create_user("user_1")
        const user_2 = await create_user("user_2")
        const status_1 = await update_status({
            text: "Hell Word",
            user_id: user_1._id,
            channel_id: channel._id,
        })
        const status_2 = await update_status({
            text: "Hell Word",
            user_id: user_2._id,
            channel_id: channel._id,
        })
        const likes_count = 5
        expect.assertions(8 * likes_count + 1)

        for (let n = 1; n <= likes_count; n++) {
            await create({
                status_id: status_1._id,
                user_id: user_2._id,
            })
            const status = (await get_status(
                {
                    status_id: status_1._id,
                },
                { disable_cache: true }
            )) as StatusSchema
            expect(status).toBeInstanceOf(Status)
            expect(status.like_count).toEqual(n)

            const likes = (await get({
                status_id: status_1._id,
                user_id: user_2._id,
            })) as StatusLikesSchema
            expect(likes).toBeInstanceOf(StatusLikes)
            expect(likes.count).toEqual(n)
        }

        for (let n = 1; n <= likes_count; n++) {
            await create({
                status_id: status_2._id,
                user_id: user_1._id,
            })

            const status = (await get_status(
                {
                    status_id: status_2._id,
                },
                { disable_cache: true }
            )) as StatusSchema
            expect(status).toBeInstanceOf(Status)
            expect(status.like_count).toEqual(n)

            const likes = (await get(
                {
                    status_id: status_2._id,
                    user_id: user_1._id,
                },
                { disable_cache: true }
            )) as StatusLikesSchema
            expect(likes).toBeInstanceOf(StatusLikes)
            expect(likes.count).toEqual(n)
        }
        {
            const all_likes = (await get({
                status_id: status_2._id,
            })) as StatusLikesSchema
            expect(all_likes).toHaveLength(1)
        }
    })
})
