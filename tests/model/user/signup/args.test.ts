import { connect } from "../../../mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"
import { signup, ErrorCodes } from "../../../../app/model/user/signup"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"

config.user_registration.limit = 0

describe("signup", () => {
    let mongodb: MongoMemoryServer | null = null
    beforeEach(async () => {
        mongodb = await connect()
    })

    afterEach(async () => {
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
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
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
                expect(error.code).toMatch(ErrorCodes.InvalidName)
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
                expect(error.code).toMatch(ErrorCodes.InvalidName)
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
                expect(error.code).toMatch(ErrorCodes.InvalidName)
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
                expect(error.code).toMatch(ErrorCodes.InvalidName)
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
                expect(error.code).toMatch(ErrorCodes.InvalidPassword)
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
                expect(error.code).toMatch(ErrorCodes.InvalidPassword)
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
                expect(error.code).toMatch(ErrorCodes.InvalidPassword)
            }
        }
    })
    test("name taken", async () => {
        expect.assertions(2)
        try {
            await signup({
                name: "beluga",
                password: "password",
                ip_address: "127.0.0.1",
            })
            await signup({
                name: "beluga",
                password: "password",
                ip_address: "127.0.0.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.NameTaken)
            }
        }
    })
    test("case insensitive", async () => {
        expect.assertions(2)
        try {
            await signup({
                name: "beluga",
                password: "password",
                ip_address: "127.0.0.1",
            })
            await signup({
                name: "Beluga",
                password: "password",
                ip_address: "127.0.0.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.NameTaken)
            }
        }
    })
})
