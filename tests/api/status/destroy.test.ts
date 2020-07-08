import { env } from "../../mongodb"
import signup from "../../../app/web/api/methods/account/signup"
import { User, UserSchema } from "../../../app/schema/user"
import create_channel from "../../../app/web/api/methods/channel/create"
import udpate_status from "../../../app/web/api/methods/status/update"
import destroy_status from "../../../app/web/api/methods/status/destroy"
import show_status from "../../../app/web/api/methods/status/show"
import { Channel, ChannelSchema } from "../../../app/schema/channel"
import { WebApiRuntimeError, InvalidAuth } from "../../../app/web/api/error"
import { Status, StatusSchema } from "../../../app/schema/status"
import { in_memory_cache } from "../../../app/lib/cache"

in_memory_cache.disable()

describe("status", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("destroy", async () => {
        expect.assertions(7)
        const user = (await signup({
            name: "beluga",
            password: "password",
            confirmed_password: "password",
            ip_address: "127.0.0.1",
            fingerprint:
                "0000000000000000000000000000000000000000000000000000000000000000",
        })) as UserSchema
        expect(user).toBeInstanceOf(User)
        const channel = (await create_channel(
            {
                name: "channel",
                is_public: true,
            },
            user
        )) as ChannelSchema
        expect(channel).toBeInstanceOf(Channel)
        try {
            await udpate_status({
                text: "Hell Word",
                channel_id: channel._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toMatch(new InvalidAuth().code)
            }
        }
        const status = (await udpate_status(
            {
                text: "Hell Word",
                channel_id: channel._id,
            },
            user
        )) as StatusSchema
        expect(status).toBeInstanceOf(Status)
        {
            const _status = (await show_status(
                {
                    status_id: status._id,
                },
                user
            )) as StatusSchema
            expect(_status).toBeInstanceOf(Status)
        }
        await destroy_status(
            {
                status_id: status._id,
            },
            user
        )
        {
            const _status = await show_status(
                {
                    status_id: status._id,
                },
                user
            )
            expect(_status).toBeNull()
        }
    })
})
