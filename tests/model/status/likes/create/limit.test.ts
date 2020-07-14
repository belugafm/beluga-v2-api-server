import { env, create_user, create_channel } from "../../../../mongodb"
import {
    create,
    ErrorCodes,
} from "../../../../../app/model/status/likes/create"
import { update as update_status } from "../../../../../app/model/status/update"
import { ModelRuntimeError } from "../../../../../app/model/error"
import config from "../../../../../app/config/app"

jest.setTimeout(30000)

describe("status/likes/create", () => {
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
    test("limit", async () => {
        expect.assertions(2)
        const status = await update_status({
            text: "Hell Word",
            user_id: user._id,
            channel_id: channel._id,
        })
        for (let index = 0; index < config.status.like.max_count; index++) {
            await create({
                status_id: status._id,
                user_id: user._id,
            })
        }
        try {
            await create({
                status_id: status._id,
                user_id: user._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.LimitReached)
            }
        }
    })
})
