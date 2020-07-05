import { connect } from "../../../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { update, ErrorCodes } from "../../../../app/model/status/update"
import { get } from "../../../../app/model/status/get"
import { destroy } from "../../../../app/model/status/destroy"
import { ModelRuntimeError } from "../../../../app/model/error"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"
import config from "../../../../app/config/app"
import { Status } from "../../../../app/schema/status"

config.status.text.max_length = 10
config.status.text.min_length = 5
jest.setTimeout(30000)

describe("status/destroy", () => {
    let mongodb: MongoMemoryReplSet | null = null
    beforeAll(async () => {
        mongodb = await connect()
    })
    afterAll(async () => {
        if (mongodb) {
            await mongodb.stop()
        }
    })
    test("ok", async () => {
        const status = await update({
            text: "aaaaab",
            user_id: mongoose.Types.ObjectId(ExampleObjectId),
            channel_id: mongoose.Types.ObjectId(ExampleObjectId),
            community_id: mongoose.Types.ObjectId(ExampleObjectId),
            is_public: true,
        })
        expect(status).toBeInstanceOf(Status)
        {
            const _status = await get({ status_id: status._id })
            expect(_status).toBeInstanceOf(Status)
        }
        await destroy({ status_id: status._id })
        {
            const _status = await get({ status_id: status._id })
            expect(_status).toBeNull()
        }
    })
})
