import { env } from "../../../mongodb"
import { update, ErrorCodes } from "../../../../app/model/status/update"
import { ModelRuntimeError } from "../../../../app/model/error"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"
import config from "../../../../app/config/app"
import { Status } from "../../../../app/schema/status"

config.status.text.max_length = 10
config.status.text.min_length = 5
jest.setTimeout(30000)

describe("status/update", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("ok", async () => {
        expect.assertions(1)
        const status = await update({
            text: "aaaaab",
            user_id: mongoose.Types.ObjectId(ExampleObjectId),
            channel_id: mongoose.Types.ObjectId(ExampleObjectId),
            community_id: mongoose.Types.ObjectId(ExampleObjectId),
            is_public: true,
        })
        expect(status).toBeInstanceOf(Status)
    })
    test("min length", async () => {
        expect.assertions(2)
        try {
            await update({
                text: "aa",
                user_id: mongoose.Types.ObjectId(ExampleObjectId),
                channel_id: mongoose.Types.ObjectId(ExampleObjectId),
                community_id: mongoose.Types.ObjectId(ExampleObjectId),
                is_public: true,
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
                user_id: mongoose.Types.ObjectId(ExampleObjectId),
                channel_id: mongoose.Types.ObjectId(ExampleObjectId),
                community_id: mongoose.Types.ObjectId(ExampleObjectId),
                is_public: true,
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
                user_id: mongoose.Types.ObjectId(ExampleObjectId),
                channel_id: mongoose.Types.ObjectId(ExampleObjectId),
                community_id: mongoose.Types.ObjectId(ExampleObjectId),
                is_public: true,
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
                channel_id: mongoose.Types.ObjectId(ExampleObjectId),
                community_id: mongoose.Types.ObjectId(ExampleObjectId),
                is_public: true,
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
                user_id: mongoose.Types.ObjectId(ExampleObjectId),
                community_id: mongoose.Types.ObjectId(ExampleObjectId),
                is_public: true,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgChannelId)
            }
        }
    })
    test("invalid is_public", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await update({
                text: "aaaaab",
                user_id: mongoose.Types.ObjectId(ExampleObjectId),
                channel_id: mongoose.Types.ObjectId(ExampleObjectId),
                community_id: mongoose.Types.ObjectId(ExampleObjectId),
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgIsPublic)
            }
        }
    })
    test("null community_id", async () => {
        expect.assertions(0)
        await update({
            text: "aaaaab",
            user_id: mongoose.Types.ObjectId(ExampleObjectId),
            channel_id: mongoose.Types.ObjectId(ExampleObjectId),
            community_id: null,
            is_public: true,
        })
    })
})
