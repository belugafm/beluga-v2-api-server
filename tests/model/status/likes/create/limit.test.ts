import { env } from "../../../../mongodb"
import {
    create,
    ErrorCodes,
} from "../../../../../app/model/status/likes/create"
import { update as update_status } from "../../../../../app/model/status/update"
import { ModelRuntimeError } from "../../../../../app/model/error"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../../app/web/api/define"
import { Status } from "../../../../../app/schema/status"
import config from "../../../../../app/config/app"

jest.setTimeout(30000)

const channel_id = mongoose.Types.ObjectId(ExampleObjectId)
const community_id = mongoose.Types.ObjectId(ExampleObjectId)

describe("status/likes/create", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("limit", async () => {
        expect.assertions(2)
        const user = await create_user("name")
        const status = await update_status({
            text: "Hell Word",
            user_id: user._id,
            channel_id,
            community_id,
            is_public: true,
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
