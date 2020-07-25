import { env } from "../../../mongodb"
import { create, ErrorCodes } from "../../../../app/model/channel/create"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"

config.channel.create_limit_per_day = 1
jest.setTimeout(30000)

describe("channel/create", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("reach limit", async () => {
        expect.assertions(2)
        await create({
            name: "チャンネル",
            creator_id: mongoose.Types.ObjectId(ExampleObjectId),
            public: true,
        })
        try {
            await create({
                name: "チャンネル",
                creator_id: mongoose.Types.ObjectId(ExampleObjectId),
                public: true,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.LimitReached)
            }
        }
    })
})
