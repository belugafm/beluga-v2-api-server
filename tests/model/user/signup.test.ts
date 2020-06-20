import { connect } from "../../mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"
import { signup, ErrorCodes } from "../../../app/model/user/signup"
import { ModelRuntimeError } from "../../../app/model/error"

describe("signup", () => {
    let mongodb: MongoMemoryServer | null = null
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
            await signup("", "password")
        } catch (e) {
            expect(e).toBeInstanceOf(ModelRuntimeError)
            if (e instanceof ModelRuntimeError) {
                expect(e.error_code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("invalid name", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await signup(2, "password")
        } catch (e) {
            expect(e).toBeInstanceOf(ModelRuntimeError)
            if (e instanceof ModelRuntimeError) {
                expect(e.error_code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("invalid name", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await signup({}, "password")
        } catch (e) {
            expect(e).toBeInstanceOf(ModelRuntimeError)
            if (e instanceof ModelRuntimeError) {
                expect(e.error_code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("invalid password", async () => {
        expect.assertions(2)
        try {
            await signup("beluga", "")
        } catch (e) {
            expect(e).toBeInstanceOf(ModelRuntimeError)
            if (e instanceof ModelRuntimeError) {
                expect(e.error_code).toMatch(ErrorCodes.InvalidPassword)
            }
        }
    })
    test("invalid password", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await signup("beluga", 2)
        } catch (e) {
            expect(e).toBeInstanceOf(ModelRuntimeError)
            if (e instanceof ModelRuntimeError) {
                expect(e.error_code).toMatch(ErrorCodes.InvalidPassword)
            }
        }
    })
    test("invalid password", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await signup("beluga", {})
        } catch (e) {
            expect(e).toBeInstanceOf(ModelRuntimeError)
            if (e instanceof ModelRuntimeError) {
                expect(e.error_code).toMatch(ErrorCodes.InvalidPassword)
            }
        }
    })
    test("name taken", async () => {
        expect.assertions(2)
        try {
            await signup("beluga", "password")
            await signup("beluga", "password")
        } catch (e) {
            expect(e).toBeInstanceOf(ModelRuntimeError)
            if (e instanceof ModelRuntimeError) {
                expect(e.error_code).toMatch(ErrorCodes.NameTaken)
            }
        }
    })
})
