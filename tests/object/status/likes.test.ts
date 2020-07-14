import { env, sleep, create_user } from "../../mongodb"
import { create } from "../../../app/model/status/likes/create"
import { update as update_status } from "../../../app/model/status/update"
import { get as get_status } from "../../../app/model/status/get"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../app/web/api/define"
import { StatusSchema } from "../../../app/schema/status"
import { StatusObject } from "../../../app/object/schema"

jest.setTimeout(30000)

const channel_id = mongoose.Types.ObjectId(ExampleObjectId)
const community_id = mongoose.Types.ObjectId(ExampleObjectId)

describe("StatusObject", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("ok", async () => {
        const user_1 = await create_user("user_1")
        const user_2 = await create_user("user_2")

        const status = await update_status({
            text: "Hell Word",
            user_id: user_1._id,
            channel_id,
            community_id,
            is_public: true,
        })
        const likes_count = 5
        for (let n = 1; n <= likes_count; n++) {
            await create({
                status_id: status._id,
                user_id: user_1._id,
            })
            await create({
                status_id: status._id,
                user_id: user_2._id,
            })
        }
        {
            const _status = (await get_status({
                status_id: status._id,
            })) as StatusSchema
            const status_object = (await _status.transform()) as StatusObject
            expect(status_object.likes.count).toEqual(2 * likes_count)
            expect(status_object.likes.users).toHaveLength(2)
        }
    })
})
