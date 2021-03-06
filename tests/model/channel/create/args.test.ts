import { env } from "../../../mongodb"
import { create, ErrorCodes } from "../../../../app/model/channel/create"
import { ModelRuntimeError } from "../../../../app/model/error"
import mongoose from "mongoose"
import { ExampleObjectId } from "../../../../app/web/api/define"

jest.setTimeout(30000)

describe("channel/create", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("max length", async () => {
        expect.assertions(0)
        await create({
            name: "チャンネル",
            creator_id: mongoose.Types.ObjectId(ExampleObjectId),
            public: true,
        })
    })
    test("invalid name", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await create({})
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgName)
            }
        }
    })
    test("invalid name", async () => {
        expect.assertions(2)
        try {
            await create({
                // @ts-ignore
                name: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgName)
            }
        }
    })
    test("invalid name", async () => {
        expect.assertions(2)
        try {
            await create({
                // @ts-ignore
                name: {},
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgName)
            }
        }
    })
    test("min length", async () => {
        expect.assertions(2)
        try {
            await create({
                name: "",
                creator_id: mongoose.Types.ObjectId(ExampleObjectId),
                public: true,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgName)
            }
        }
    })
    test("max length", async () => {
        expect.assertions(2)
        try {
            await create({
                name: "0123456789012345678901234567890123456789",
                creator_id: mongoose.Types.ObjectId(ExampleObjectId),
                public: true,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgName)
            }
        }
    })
})
