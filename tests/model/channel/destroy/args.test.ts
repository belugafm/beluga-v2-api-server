import { connect } from "../../../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { destroy, ErrorCodes } from "../../../../app/model/channel/destroy"
import { ModelRuntimeError } from "../../../../app/model/error"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"

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
    test("invalid channel_id", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await destroy({
                creator_id: mongoose.Types.ObjectId(ExampleObjectId),
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgChannelId)
            }
        }
        return
    })
    test("invalid creator_id", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await destroy({
                channel_id: mongoose.Types.ObjectId(ExampleObjectId),
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgCreatorId)
            }
        }
        return
    })
})
