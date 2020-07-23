import { env, create_user } from "../../mongodb"
import { create } from "../../../app/model/user/mutes/create"
import { destroy } from "../../../app/model/user/mutes/destroy"
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
        }
        await create({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        {
            const object = (await target_user.transform(auth_user, {
                disable_cache: true,
            })) as UserObject
            expect(object.muted).toBeTruthy()
        }
        await destroy({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
        {
            const object = (await target_user.transform(auth_user, {
                disable_cache: true,
            })) as UserObject
            expect(object.muted).toBeFalsy()
        }
    })
})
