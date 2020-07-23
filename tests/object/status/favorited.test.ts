import { env, sleep, create_user, create_channel } from "../../mongodb"
import { create } from "../../../app/model/status/favorites/create"
import { destroy } from "../../../app/model/status/favorites/destroy"
import {
    favorited,
    get_cached_value,
} from "../../../app/object/types/status/favorited"
import { update as update_status } from "../../../app/model/status/update"
import mongoose from "mongoose"

jest.setTimeout(30000)

describe("StatusObject::favorited", () => {
    // @ts-ignore
    let channel: ChannelSchema = null

    beforeAll(async () => {
        await env.connect()
        const user = await create_user()
        channel = await create_channel("channel", user._id)
        favorited._cache.on()
    })
    afterAll(async () => {
        await favorited._cache.off()
        await env.disconnect()
    })
    test("cache", async () => {
        const user_1 = await create_user()
        const user_2 = await create_user()

        const status = await update_status({
            text: "Hell Word",
            user_id: user_1._id,
            channel_id: channel._id,
        })
        {
            const flag = get_cached_value(status, user_1)
            expect(flag).toBeNull()
        }
        {
            const flag = await favorited(status, user_1)
            expect(flag).toBeFalsy()
            const document_id =
                favorited._map.data[user_1._id.toHexString()][
                    status._id.toHexString()
                ].value
            expect(document_id).toBeNull()
        }
        await create({
            status_id: status._id,
            user_id: user_1._id,
        })
        await sleep(2)
        {
            expect(
                Object.keys(favorited._map.data[user_1._id.toHexString()])
            ).toHaveLength(0)
            expect(Object.keys(favorited._cache.data)).toHaveLength(0)
        }
        {
            const flag = await favorited(status, user_1)
            expect(flag).toBeTruthy()
            const document_id =
                favorited._map.data[user_1._id.toHexString()][
                    status._id.toHexString()
                ].value
            expect(document_id).toBeInstanceOf(mongoose.Types.ObjectId)
            const document =
                favorited._cache.data[document_id.toHexString()][
                    document_id.toHexString()
                ]
            expect(document.value._id).toBe(document_id)
        }
        {
            const flag = get_cached_value(status, user_1)
            expect(flag).toBeTruthy()
        }
        {
            favorited._cache.data = {}
            const flag = get_cached_value(status, user_1)
            expect(flag).toBeNull()
        }
        {
            favorited._map.data = {}
            const flag = get_cached_value(status, user_1)
            expect(flag).toBeNull()
        }
        {
            const flag = await favorited(status, user_1)
            expect(flag).toBeTruthy()
        }
        await destroy({
            status_id: status._id,
            user_id: user_1._id,
        })
        await sleep(2)
        {
            expect(
                Object.keys(favorited._map.data[user_1._id.toHexString()])
            ).toHaveLength(1)
            expect(Object.keys(favorited._cache.data)).toHaveLength(0)
        }
        await create({
            status_id: status._id,
            user_id: user_1._id,
        })
        await create({
            status_id: status._id,
            user_id: user_2._id,
        })
        await sleep(2)
        {
            const flag = await favorited(status, user_1)
            expect(flag).toBeTruthy()
        }
        {
            const flag = await favorited(status, user_2)
            expect(flag).toBeTruthy()
        }
        await destroy({
            status_id: status._id,
            user_id: user_1._id,
        })
        await sleep(2)
        {
            expect(
                Object.keys(favorited._map.data[user_1._id.toHexString()])
            ).toHaveLength(1)
            expect(
                Object.keys(favorited._map.data[user_2._id.toHexString()])
            ).toHaveLength(1)
            expect(Object.keys(favorited._cache.data)).toHaveLength(1)
        }
    })
})
