import { env, create_user } from "../../../../mongodb"
import {
    create,
    ErrorCodes,
} from "../../../../../app/model/status/likes/create"
import { update as update_status } from "../../../../../app/model/status/update"
import { ModelRuntimeError } from "../../../../../app/model/error"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../../app/web/api/define"
import { Status } from "../../../../../app/schema/status"
import { StatusLikes } from "../../../../../app/schema/status_likes"

jest.setTimeout(30000)

const channel_id = mongoose.Types.ObjectId(ExampleObjectId)
const community_id = mongoose.Types.ObjectId(ExampleObjectId)

describe("status/likes/create", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("ok", async () => {
        expect.assertions(2)
        const user = await create_user("name")
        const status = await update_status({
            text: "Hell Word",
            user_id: user._id,
            channel_id,
            community_id,
            is_public: true,
        })
        expect(status).toBeInstanceOf(Status)
        const likes = await create({
            status_id: status._id,
            user_id: user._id,
        })
        expect(likes).toBeInstanceOf(StatusLikes)
    })
    test("user_id", async () => {
        expect.assertions(2)
        const user = await create_user("name")
        try {
            const status = await update_status({
                text: "Hell Word",
                user_id: user._id,
                channel_id,
                community_id,
                is_public: true,
            })
            // @ts-ignore
            const likes = await create({
                status_id: status._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgUserId)
            }
        }
    })
    test("user_id", async () => {
        expect.assertions(2)
        const user = await create_user("name")
        try {
            const status = await update_status({
                text: "Hell Word",
                user_id: user._id,
                channel_id,
                community_id,
                is_public: true,
            })
            // @ts-ignore
            const likes = await create({
                status_id: status._id,
                user_id: mongoose.Types.ObjectId(ExampleObjectId),
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.UserNotFound)
            }
        }
    })
    test("status_id", async () => {
        expect.assertions(2)
        const user = await create_user("name")
        try {
            const status = await update_status({
                text: "Hell Word",
                user_id: user._id,
                channel_id,
                community_id,
                is_public: true,
            })
            // @ts-ignore
            const likes = await create({
                user_id: user._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgStatusId)
            }
        }
    })
})
