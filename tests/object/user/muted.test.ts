import { env, sleep, create_user } from "../../mongodb"
import { create } from "../../../app/model/user/mutes/create"
import { destroy } from "../../../app/model/user/mutes/destroy"
import { muted, get_cached_value } from "../../../app/object/types/user/mutes"
import mongoose from "mongoose"

jest.setTimeout(30000)

describe("UserObject", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("muted", async () => {
        const auth_user = await create_user()
        const target_user = await create_user()
        {
            const flag = get_cached_value(target_user, auth_user)
            expect(flag).toBeNull()
        }
        {
            const flag = await muted(target_user, auth_user)
            expect(flag).toBeFalsy()
            const document_id =
                muted._map.data[auth_user._id.toHexString()][
                    target_user._id.toHexString()
                ].value
            expect(document_id).toBeNull()
        }
        await create({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        await sleep(2)
        {
            expect(
                Object.keys(muted._map.data[auth_user._id.toHexString()])
            ).toHaveLength(0)
            expect(Object.keys(muted._cache.data)).toHaveLength(0)
        }
        {
            const flag = await muted(target_user, auth_user)
            expect(flag).toBeTruthy()
            const document_id =
                muted._map.data[auth_user._id.toHexString()][
                    target_user._id.toHexString()
                ].value
            expect(document_id).toBeInstanceOf(mongoose.Types.ObjectId)
            const document =
                muted._cache.data[document_id.toHexString()][
                    document_id.toHexString()
                ]
            expect(document.value._id).toBe(document_id)
        }
        {
            const flag = get_cached_value(target_user, auth_user)
            expect(flag).toBeTruthy()
        }
        {
            muted._cache.data = {}
            const flag = get_cached_value(target_user, auth_user)
            expect(flag).toBeNull()
        }
        {
            muted._map.data = {}
            const flag = get_cached_value(target_user, auth_user)
            expect(flag).toBeNull()
        }
        {
            const flag = await muted(target_user, auth_user)
            expect(flag).toBeTruthy()
        }
        await destroy({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        await sleep(2)
        {
            expect(
                Object.keys(muted._map.data[auth_user._id.toHexString()])
            ).toHaveLength(1)
            expect(Object.keys(muted._cache.data)).toHaveLength(0)
        }
        await create({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        await create({
            auth_user_id: target_user._id,
            target_user_id: auth_user._id,
        })
        await sleep(2)
        {
            const flag = await muted(target_user, auth_user)
            expect(flag).toBeTruthy()
        }
        {
            const flag = await muted(auth_user, target_user)
            expect(flag).toBeTruthy()
        }
        await destroy({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        await sleep(2)
        {
            expect(
                Object.keys(muted._map.data[auth_user._id.toHexString()])
            ).toHaveLength(1)
            expect(
                Object.keys(muted._map.data[target_user._id.toHexString()])
            ).toHaveLength(1)
            expect(Object.keys(muted._cache.data)).toHaveLength(1)
        }
    })
})
