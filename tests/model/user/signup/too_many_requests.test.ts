import { env } from "../../../mongodb"
import { signup, ErrorCodes } from "../../../../app/model/user/signup"
import { ModelRuntimeError } from "../../../../app/model/error"
import config from "../../../../app/config/app"
import * as mongo from "../../../../app/lib/mongoose"
import { document_cache } from "../../../../app/document/cache"
import { DormantUser, User } from "../../../../app/schema/user"

document_cache.disable()

config.user_registration.limit = 5
config.user_registration.reclassify_inactive_as_dormant_after = 10
jest.setTimeout(
    (config.user_registration.reclassify_inactive_as_dormant_after +
        config.user_registration.limit) *
        1000 *
        5
)

async function sleep(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

describe("user/signup", () => {
    beforeEach(async () => {
        await env.connect()
    })
    afterEach(async () => {
        await env.disconnect()
    })
    test("too many request", async () => {
        expect.assertions(12)
        new Date(),
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
            await sleep(config.user_registration.limit - 2)
            try {
                new Date(),
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
            await sleep(config.user_registration.limit)
            try {
                new Date(),
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
                config.user_registration.reclassify_inactive_as_dormant_after
            )
            new Date(),
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
