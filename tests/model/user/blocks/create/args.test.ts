import { env, create_user } from "../../../../mongodb"
import { create, ErrorCodes } from "../../../../../app/model/user/blocks/create"
import { ModelRuntimeError } from "../../../../../app/model/error"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../../app/web/api/define"

jest.setTimeout(30000)

describe("blocks/create", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("ok", async () => {
        const auth_user = await create_user()
        const target_user = await create_user()
        await create({
            auth_user_id: auth_user._id,
            target_user_id: target_user._id,
        })
    })
    test("invalid_arg_auth_user_id", async () => {
        expect.assertions(2)
        const target_user = await create_user()
        try {
            // @ts-ignore
            await create({
                target_user_id: target_user._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgAuthUserId)
            }
        }
    })
    test("invalid_arg_target_user_id", async () => {
        expect.assertions(2)
        const auth_user = await create_user()
        try {
            // @ts-ignore
            await create({
                auth_user_id: auth_user._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgTargetUserId)
            }
        }
    })
    test("cannot_block_self", async () => {
        expect.assertions(2)
        const auth_user = await create_user()
        try {
            await create({
                auth_user_id: auth_user._id,
                target_user_id: auth_user._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.CannotBlockSelf)
            }
        }
    })
    test("auth_user_not_found", async () => {
        expect.assertions(2)
        const target_user = await create_user()
        try {
            await create({
                auth_user_id: mongoose.Types.ObjectId(ExampleObjectId),
                target_user_id: target_user._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.AuthUserNotFound)
            }
        }
    })
    test("target_user_not_found", async () => {
        expect.assertions(2)
        const auth_user = await create_user()
        try {
            await create({
                auth_user_id: auth_user._id,
                target_user_id: mongoose.Types.ObjectId(ExampleObjectId),
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.TargetUserNotFound)
            }
        }
    })
})
