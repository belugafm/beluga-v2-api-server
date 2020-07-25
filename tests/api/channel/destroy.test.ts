import { env, create_user } from "../../mongodb"
import create_channel from "../../../app/web/api/methods/channel/create"
import destroy_channel from "../../../app/web/api/methods/channel/destroy"
import get_channel, {
    expected_error_specs,
} from "../../../app/web/api/methods/channel/show"
import { Channel, ChannelSchema } from "../../../app/schema/channel"
import { WebApiRuntimeError, InvalidAuth } from "../../../app/web/api/error"
import { document_cache } from "../../../app/document/cache"

document_cache.disable()

describe("channel", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("destroy", async () => {
        expect.assertions(5)
        const user = await create_user()
        try {
            await create_channel({
                name: "channel",
                public: true,
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
                public: true,
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
            try {
                const _channel = await get_channel(
                    {
                        channel_id: channel._id,
                    },
                    user
                )
            } catch (error) {
                expect(error).toBeInstanceOf(WebApiRuntimeError)
                if (error instanceof WebApiRuntimeError) {
                    expect(error.code).toMatch(
                        expected_error_specs.channel_not_found.code
                    )
                }
            }
        }
    })
})
