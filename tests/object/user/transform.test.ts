import { env, create_user } from "../../mongodb"
import { create as create_mute } from "../../../app/model/user/mutes/create"
import { create as create_block } from "../../../app/model/user/blocks/create"
import { destroy as destroy_mute } from "../../../app/model/user/mutes/destroy"
import { destroy as destroy_blocks } from "../../../app/model/user/blocks/destroy"
import { UserObject } from "../../../app/object/schema"

jest.setTimeout(30000)

describe("UserObject", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("transform", async () => {
        const auth_user = await create_user()
        const target_user = await create_user()
        {
            const object = (await target_user.transform(auth_user, {
                disable_cache: true,
            })) as UserObject
            expect(object.muted).toBeFalsy()
            expect(object.blocked).toBeFalsy()
        }
        await create_mute({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        {
            const object = (await target_user.transform(auth_user, {
                disable_cache: true,
            })) as UserObject
            expect(object.muted).toBeTruthy()
            expect(object.blocked).toBeFalsy()
        }
        await destroy_mute({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        {
            const object = (await target_user.transform(auth_user, {
                disable_cache: true,
            })) as UserObject
            expect(object.muted).toBeFalsy()
            expect(object.blocked).toBeFalsy()
        }
        await create_block({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        {
            const object = (await target_user.transform(auth_user, {
                disable_cache: true,
            })) as UserObject
            expect(object.muted).toBeFalsy()
            expect(object.blocked).toBeTruthy()
        }
        await destroy_blocks({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        {
            const object = (await target_user.transform(auth_user, {
                disable_cache: true,
            })) as UserObject
            expect(object.muted).toBeFalsy()
            expect(object.blocked).toBeFalsy()
        }
    })
})
