import { connect } from "../../../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { create, ErrorCodes } from "../../../../app/model/channel/create"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"

config.channel.create_limit_per_day = 1
jest.setTimeout(30000)

async function sleep(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

describe("channel/create", () => {
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
        expect.assertions(2)
        await create({
            name: "チャンネル",
            creator_id: mongoose.Types.ObjectId(ExampleObjectId),
            is_public: true,
        })
        try {
            await create({
                name: "チャンネル",
                creator_id: mongoose.Types.ObjectId(ExampleObjectId),
                is_public: true,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.LimitReached)
            }
        }
    })
})
