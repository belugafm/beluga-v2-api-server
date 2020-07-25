import { env } from "../../../mongodb"
import {
    create,
    ErrorCodes as CreateErrorCodes,
} from "../../../../app/model/channel/create"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"
import { destroy } from "../../../../app/model/channel/destroy"
import { document_cache } from "../../../../app/document/cache"

document_cache.disable()

config.channel.create_limit_per_day = 1
jest.setTimeout(30000)

describe("channel/destroy", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("reach limit", async () => {
        const repeats = 3
        expect.assertions(2 * repeats)
        for (let index = 0; index < repeats; index++) {
            const creator_id = mongoose.Types.ObjectId(ExampleObjectId)
            const channel = await create({
                name: "チャンネル",
                creator_id: creator_id,
                public: true,
            })
            try {
                await create({
                    name: "チャンネル",
                    creator_id: creator_id,
                    public: true,
                })
            } catch (error) {
                expect(error).toBeInstanceOf(ModelRuntimeError)
                if (error instanceof ModelRuntimeError) {
                    expect(error.code).toMatch(CreateErrorCodes.LimitReached)
                }
            }
            await destroy({
                channel_id: channel._id,
            })
            const new_channel = await create({
                name: "チャンネル",
                creator_id: creator_id,
                public: true,
            })
            await destroy({
                channel_id: new_channel._id,
            })
        }
    })
})
