import { connect } from "../../../mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { signup, ErrorCodes } from "../../../../app/model/user/signup"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import { DormantUser, User } from "../../../../app/schema/user"
import * as mongo from "../../../../app/lib/mongoose"

config.user_registration.limit = 3
config.user_registration.reclassify_inactive_as_dormant_period = 10
jest.setTimeout(
    config.user_registration.reclassify_inactive_as_dormant_period * 1000 * 3
)

async function sleep(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

describe("signup", () => {
    let mongodb: any = null
    beforeEach(async () => {
        mongodb = await connect()
    })
    afterEach(async () => {
        if (mongodb) {
            await mongodb.stop()
        }
    })
    test("too many request", async () => {
        expect.assertions(12)
        await signup({
            name: "beluga",
            password: "password",
            ip_address: "127.0.0.1",
        })
        for (
            let num_dormant_users = 1;
            num_dormant_users <= 2;
            num_dormant_users++
        ) {
            await sleep(config.user_registration.limit - 1)
            try {
                await signup({
                    name: "Beluga",
                    password: "password",
                    ip_address: "127.0.0.1",
                })
            } catch (error) {
                expect(error).toBeInstanceOf(ModelRuntimeError)
                if (error instanceof ModelRuntimeError) {
                    expect(error.code).toMatch(ErrorCodes.TooManyRequests)
                }
            }
            await sleep(2)
            try {
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
            await sleep(
                config.user_registration.reclassify_inactive_as_dormant_period -
                    config.user_registration.limit
            )
            await signup({
                name: "Beluga",
                password: "password",
                ip_address: "127.0.0.1",
            })

            const users = await mongo.find(User, {})
            expect(users).toHaveLength(1)

            const dormant_users = await mongo.find(DormantUser, {})
            expect(dormant_users).toHaveLength(num_dormant_users)
        }
    })
})
