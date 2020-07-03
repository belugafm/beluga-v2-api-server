import { connect } from "../../../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { signup, ErrorCodes } from "../../../../app/model/user/signup"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"

config.user_registration.limit = 0
jest.setTimeout(30000)

describe("user/signup", () => {
    let mongodb: MongoMemoryReplSet | null = null
    beforeEach(async () => {
        mongodb = await connect()
    })
    afterEach(async () => {
        if (mongodb) {
            await mongodb.stop()
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
