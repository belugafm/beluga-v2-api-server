import { connect } from "../../mongodb"
import signup from "../../../app/web/api/methods/account/signup"
import { User, UserSchema } from "../../../app/schema/user"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import create_channel from "../../../app/web/api/methods/channel/create"
import destroy_channel from "../../../app/web/api/methods/channel/destroy"
import get_channel from "../../../app/web/api/methods/channel/show"
import { Channel, ChannelSchema } from "../../../app/schema/channel"
import { WebApiRuntimeError, InvalidAuth } from "../../../app/web/api/error"

describe("channel", () => {
    let mongodb: MongoMemoryReplSet | null = null
    beforeAll(async () => {
        mongodb = await connect()
    })
    afterAll(async () => {
        if (mongodb) {
            await mongodb.stop()
        }
    })
    test("destroy", async () => {
        expect.assertions(5)
        const user = (await signup({
            name: "beluga",
            password: "password",
            confirmed_password: "password",
            ip_address: "127.0.0.1",
            fingerprint:
                "0000000000000000000000000000000000000000000000000000000000000000",
        })) as UserSchema
        expect(user).toBeInstanceOf(User)
        try {
            await create_channel({
                name: "channel",
                is_public: true,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toMatch(new InvalidAuth().code)
            }
        }
        const channel = (await create_channel(
            {
                name: "channel",
                is_public: true,
            },
            user
        )) as ChannelSchema
        {
            const _channel = await get_channel(
                {
                    channel_id: channel._id,
                },
                user
            )
            expect(_channel).toBeInstanceOf(Channel)
        }
        await destroy_channel(
            {
                channel_id: channel._id,
            },
            user
        )
        {
            const _channel = await get_channel(
                {
                    channel_id: channel._id,
                },
                user
            )
            expect(_channel).toBeNull()
        }
    })
})