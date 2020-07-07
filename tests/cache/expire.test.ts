import { connect } from "../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { update, ErrorCodes } from "../../app/model/status/update"
import { get } from "../../app/model/status/get"
import { destroy } from "../../app/model/status/destroy"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../app/web/api/define"
import config from "../../app/config/app"
import { Status } from "../../app/schema/status"
import { in_memory_cache } from "../../app/lib/cache"

config.in_memory_cache.default_expire_seconds = 5
jest.setTimeout(30000)

async function sleep(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

describe("in_memory_cache", () => {
    let mongodb: MongoMemoryReplSet | null = null
    beforeAll(async () => {
        mongodb = await connect()
    })
    afterAll(async () => {
        if (mongodb) {
            await mongodb.stop()
        }
    })
    test("expire", async () => {
        const status = await update({
            text: "Hell Word",
            user_id: mongoose.Types.ObjectId(ExampleObjectId),
            channel_id: mongoose.Types.ObjectId(ExampleObjectId),
            community_id: mongoose.Types.ObjectId(ExampleObjectId),
            is_public: true,
        })
        expect(status).toBeInstanceOf(Status)
        await get({ status_id: status._id })
        {
            const cached_status = in_memory_cache.get(
                Status.modelName,
                JSON.stringify({
                    _id: status._id,
                })
            )
            expect(cached_status).toBeInstanceOf(Status)
            expect(cached_status?._cached).toBeTruthy()
        }
        await sleep(10)
        {
            const cached_status = in_memory_cache.get(
                Status.modelName,
                JSON.stringify({
                    _id: status._id,
                })
            )
            expect(cached_status).toBeNull()
        }
    })
})
