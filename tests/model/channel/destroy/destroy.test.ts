import { connect } from "../../../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import {
    create,
    ErrorCodes as CreateErrorCodes,
} from "../../../../app/model/channel/create"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"
import {
    destroy,
    ErrorCodes as DestroyErrorCodes,
} from "../../../../app/model/channel/destroy"

config.channel.create_limit_per_day = 1
jest.setTimeout(30000)

async function sleep(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

describe("channel/destroy", () => {
    let mongodb: MongoMemoryReplSet | null = null
    beforeAll(async () => {
        mongodb = await connect()
    })
    afterAll(async () => {
        if (mongodb) {
            await mongodb.stop()
        }
    })
    test("reach limit", async () => {
        const repeats = 3
        expect.assertions(2 * repeats)
        for (let index = 0; index < repeats; index++) {
            const creator_id = mongoose.Types.ObjectId(ExampleObjectId)
            const channel = await create({
                name: "チャンネル",
                creator_id: creator_id,
                is_public: true,
            })
            try {
                await create({
                    name: "チャンネル",
                    creator_id: creator_id,
                    is_public: true,
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
                is_public: true,
            })
            await destroy({
                channel_id: new_channel._id,
            })
        }
    })
})
