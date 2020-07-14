import { env, create_user, create_channel } from "../mongodb"
import { update } from "../../app/model/status/update"
import { get } from "../../app/model/status/get"
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
    test("expire", async () => {
        const status = await update({
            text: "Hell Word",
            user_id: user._id,
            channel_id: channel._id,
        })
        expect(status).toBeInstanceOf(Status)
        await get({ status_id: status._id })
        {
            const cached_status = in_memory_cache.get(
                Status.modelName,
                status._id.toHexString()
            )
            expect(cached_status).toBeInstanceOf(Status)
            expect(cached_status?._cached).toBeTruthy()
        }
        await sleep(10)
        {
            const cached_status = in_memory_cache.get(
                Status.modelName,
                status._id.toHexString()
            )
            expect(cached_status).toBeNull()
        }
    })
})
