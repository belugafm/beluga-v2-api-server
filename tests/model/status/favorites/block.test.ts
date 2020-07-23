import { env, create_user, create_channel } from "../../../mongodb"
import {
    create as create_favorite,
    ErrorCodes,
} from "../../../../app/model/status/favorites/create"
import { destroy as destroy_favorite } from "../../../../app/model/status/favorites/destroy"
import { update as update_status } from "../../../../app/model/status/update"
import { create as create_block } from "../../../../app/model/user/blocks/create"
import { destroy as destroy_block } from "../../../../app/model/user/blocks/destroy"
import { ModelRuntimeError } from "../../../../app/model/error"

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
    test("block", async () => {
        expect.assertions(2)
        const user_1 = await create_user("user_1")
        const user_2 = await create_user("user_2")
        const status_1 = await update_status({
            text: "Hell Word",
            user_id: user_1._id,
            channel_id: channel._id,
        })
        await create_favorite({
            status_id: status_1._id,
            user_id: user_2._id,
        })
        await destroy_favorite({
            status_id: status_1._id,
            user_id: user_2._id,
        })
        await create_block({
            auth_user_id: status_1.user_id,
            target_user_id: user_2._id,
        })
        try {
            await create_favorite({
                status_id: status_1._id,
                user_id: user_2._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.CannotCreateFavorite)
            }
        }
        await destroy_block({
            auth_user_id: status_1.user_id,
            target_user_id: user_2._id,
        })
        await create_favorite({
            status_id: status_1._id,
            user_id: user_2._id,
        })
    })
})
