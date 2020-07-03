import { connect } from "../../../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { signup, ErrorCodes } from "../../../../app/model/user/signup"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"

config.user_registration.limit = 0
jest.setTimeout(30000)

describe("signup", () => {
    let mongodb: MongoMemoryReplSet | null = null
    beforeAll(async () => {
        mongodb = await connect()
    })
    afterAll(async () => {
        if (mongodb) {
            await mongodb.stop()
        }
    })
    test("invalid name", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await signup({
                password: "password",
                ip_address: "127.0.0.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgName)
            }
        }
        return
    })
    test("invalid name", async () => {
        expect.assertions(2)
        try {
            await signup({
                // @ts-ignore
                name: 2,
                password: "password",
                ip_address: "127.0.0.1",
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
            await signup({
                // @ts-ignore
                name: {},
                password: "password",
                ip_address: "127.0.0.1",
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
            await signup({
                name: "",
                password: "password",
                ip_address: "127.0.0.1",
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
            await signup({
                name: "0123456789012345678901234567890123456789",
                password: "password",
                ip_address: "127.0.0.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgName)
            }
        }
    })

    test("invalid password", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await signup({
                name: "beluga",
                ip_address: "127.0.0.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgPassword)
            }
        }
    })
    test("invalid password", async () => {
        expect.assertions(2)
        try {
            await signup({
                name: "beluga",
                // @ts-ignore
                password: 2,
                ip_address: "127.0.0.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgPassword)
            }
        }
    })
    test("invalid password", async () => {
        expect.assertions(2)
        try {
            await signup({
                name: "beluga",
                // @ts-ignore
                password: {},
                ip_address: "127.0.0.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgPassword)
            }
        }
    })
})
