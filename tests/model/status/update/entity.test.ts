import { env, create_user, create_channel } from "../../../mongodb"
import { update } from "../../../../app/model/status/update"
import config from "../../../../app/config/app"
import { UserSchema } from "../../../../app/schema/user"
import { ChannelSchema } from "../../../../app/schema/channel"

jest.setTimeout(30000)

describe("status/update", () => {
    // @ts-ignore
    let user: UserSchema = null

    beforeAll(async () => {
        await env.connect()
        user = await create_user()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("channel url", async () => {
        const channel_1 = await create_channel("channel", user._id)
        const channel_2 = await create_channel("channel", user._id)

        const base_url = config.server.get_base_url()
        const channel_url_1 = `${base_url}/channel/${channel_1._id}`
        const channel_url_2 = `${base_url}/channel/${channel_2._id}`

        {
            const status = await update({
                text: `${channel_url_1}`,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(1)
        }
        {
            const status = await update({
                text: `${channel_url_1}   `,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(1)
        }
        {
            const status = await update({
                text: `${channel_url_1} aaaaaaaaaaaaaaaaaaa`,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(1)
        }
        {
            const status = await update({
                text: `      ${channel_url_1}`,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(1)
        }
        {
            const status = await update({
                text: `     aaaaaaaaaaa ${channel_url_1}`,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(1)
        }
        {
            const status = await update({
                text: `a${channel_url_1}`,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(0)
        }
        {
            const status = await update({
                text: `${channel_url_1}a`,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(0)
        }
        {
            const status = await update({
                text: `
                ${channel_url_1}
                ${channel_url_2}`,
                user_id: user._id,
                channel_id: channel_1._id,
            })
            expect(Object.keys(status.entities.channels).length).toBe(2)
        }
    })
    test("status url", async () => {
        const channel = await create_channel("channel", user._id)
        const status_1 = await update({
            text: "Hell Word",
            user_id: user._id,
            channel_id: channel._id,
        })
        const status_2 = await update({
            text: "Hell Word",
            user_id: user._id,
            channel_id: channel._id,
        })

        const base_url = config.server.get_base_url()
        const status_url_1 = `${base_url}/status/${status_1._id}`
        const status_url_2 = `${base_url}/thread/${status_2._id}`

        {
            const status = await update({
                text: `${status_url_1}`,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(1)
        }
        {
            const status = await update({
                text: `${status_url_1}   `,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(1)
        }
        {
            const status = await update({
                text: `${status_url_1} aaaaaaaaaaaaaaaaaaa`,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(1)
        }
        {
            const status = await update({
                text: `      ${status_url_1}`,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(1)
        }
        {
            const status = await update({
                text: `     aaaaaaaaaaa ${status_url_1}`,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(1)
        }
        {
            const status = await update({
                text: `a${status_url_1}`,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(0)
        }
        {
            const status = await update({
                text: `${status_url_1}a`,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(0)
        }
        {
            const status = await update({
                text: `
                ${status_url_1}
                ${status_url_2}`,
                user_id: user._id,
                channel_id: channel._id,
            })
            expect(Object.keys(status.entities.statuses).length).toBe(2)
        }
    })
})
