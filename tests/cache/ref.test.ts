import { env, create_user, create_channel } from "../mongodb"
import { update } from "../../app/model/status/update"
import { get } from "../../app/model/status/get"
import { destroy } from "../../app/model/status/destroy"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../app/web/api/define"
import { Status } from "../../app/schema/status"

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
    test("ref", async () => {
        const initial_text = "initial text"
        const status = await update({
            text: initial_text,
            user_id: user._id,
            channel_id: channel._id,
        })
        expect(status).toBeInstanceOf(Status)
        expect(status._cached).toBeUndefined()

        const cached_status = await get({
            status_id: status._id,
        })
        expect(cached_status).toBeInstanceOf(Status)
        expect(cached_status?._cached).toBeTruthy()

        const updated_text = "new text"
        status.text = updated_text
        await status.save()
        await sleep(1)
        {
            const _status = await Status.findOne({ _id: status._id })
            expect(_status).toBeInstanceOf(Status)
            expect(_status?.text).toBe(updated_text)
        }
        expect(cached_status?.text).toBe(initial_text)
        {
            const _cached_status = await get({
                status_id: status._id,
            })
            expect(_cached_status).toBeInstanceOf(Status)
            expect(_cached_status?._cached).toBeTruthy()
            expect(_cached_status?.text).toBe(updated_text)
        }
        await destroy({
            status_id: status._id,
        })
        await sleep(1)
        {
            const _status = await Status.findOne({ _id: status._id })
            expect(_status).toBeNull()
        }
        {
            const _status = await get({
                status_id: status._id,
            })
            expect(_status).toBeNull()
        }
        expect(cached_status?.text).toBe(initial_text)
    })
})
