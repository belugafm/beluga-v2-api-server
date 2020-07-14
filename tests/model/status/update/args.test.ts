import { env, create_user, create_channel } from "../../../mongodb"
import { update, ErrorCodes } from "../../../../app/model/status/update"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import { Status } from "../../../../app/schema/status"
import { UserSchema } from "app/schema/user"
import { ChannelSchema } from "app/schema/channel"

config.status.text.max_length = 10
config.status.text.min_length = 5
jest.setTimeout(30000)

describe("status/update", () => {
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
    test("ok", async () => {
        expect.assertions(1)
        const status = await update({
            text: "aaaaab",
            user_id: user._id,
            channel_id: channel._id,
        })
        expect(status).toBeInstanceOf(Status)
    })
    test("min length", async () => {
        expect.assertions(2)
        try {
            await update({
                text: "aa",
                user_id: user._id,
                channel_id: channel._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgText)
            }
        }
    })
    test("max length", async () => {
        expect.assertions(2)
        try {
            await update({
                text: "aaaaabbbbbccccc",
                user_id: user._id,
                channel_id: channel._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgText)
            }
        }
    })
    test("invalid text", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await update({
                user_id: user._id,
                channel_id: channel._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgText)
            }
        }
    })
    test("invalid user_id", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await update({
                text: "aaaaab",
                channel_id: channel._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgUserId)
            }
        }
    })
    test("invalid channel_id", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await update({
                text: "aaaaab",
                user_id: user._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgChannelId)
            }
        }
    })
    test("null community_id", async () => {
        expect.assertions(0)
        await update({
            text: "aaaaab",
            user_id: user._id,
            channel_id: channel._id,
        })
    })
})
