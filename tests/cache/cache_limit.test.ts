import { env, create_user, create_channel } from "../mongodb"
import { update } from "../../app/model/status/update"
import { get } from "../../app/model/status/get"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../app/web/api/define"
import config from "../../app/config/app"
import { Status } from "../../app/schema/status"
import { in_memory_cache } from "../../app/lib/cache"

config.in_memory_cache.cache_limit = 10
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
        const num_repeats = 11
        const statuses = []
        for (let index = 0; index < num_repeats; index++) {
            statuses.push(
                await update({
                    text: "Hell Word",
                    user_id: user._id,
                    channel_id: channel._id,
                })
            )
        }

        for (let index = 0; index < num_repeats; index++) {
            const status_id = statuses[index]._id
            await get({ status_id })
            if (index < 10) {
                expect(
                    // @ts-ignore
                    in_memory_cache.data[Status.modelName].length == index + 1
                )
            } else {
                // @ts-ignore
                expect(in_memory_cache.data[Status.modelName].length == 1)
            }
        }
    })
})
