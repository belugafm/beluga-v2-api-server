import { env, create_user, create_channel } from "../../../mongodb"
import {
    create,
    ErrorCodes as CreateErrorCodes,
} from "../../../../app/model/status/favorites/create"
import {
    destroy,
    ErrorCodes as DestroyErrorCodes,
} from "../../../../app/model/status/favorites/destroy"
import { get } from "../../../../app/model/status/favorites/get"
import { update as update_status } from "../../../../app/model/status/update"
import { get as get_status } from "../../../../app/model/status/get"
import { Status, StatusSchema } from "../../../../app/schema/status"
import {
    StatusFavorites,
    StatusFavoritesSchema,
} from "../../../../app/schema/status_favorites"
import { ModelRuntimeError } from "../../../../app/model/error"

jest.setTimeout(30000)

describe("status/favorites/destroy", () => {
    // @ts-ignore
    let user: UserSchema = null
    // @ts-ignore
    let channel: ChannelSchema = null

    beforeAll(async () => {
        await env.connect()
        user = await create_user()
        channel = await create_channel("channel", user._id)
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("destroy", async () => {
        const user_1 = await create_user("user_1")
        const user_2 = await create_user("user_2")
        const status = await update_status({
            text: "Hell Word",
            user_id: user_1._id,
            channel_id: channel._id,
        })
        expect.assertions(22)

        await create({
            status_id: status._id,
            user_id: user_1._id,
        })
        try {
            await create({
                status_id: status._id,
                user_id: user_1._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(CreateErrorCodes.AlreadyFavorited)
            }
        }
        {
            const _status = (await get_status(
                {
                    status_id: status._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusSchema
            expect(_status).toBeInstanceOf(Status)
            expect(_status.favorite_count).toEqual(1)

            const favorite = (await get(
                {
                    status_id: status._id,
                    user_id: user_1._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusFavoritesSchema
            expect(favorite).toBeInstanceOf(StatusFavorites)
        }
        {
            const favorites = (await get({
                status_id: status._id,
            })) as StatusFavoritesSchema
            expect(favorites).toHaveLength(1)
        }

        await create({
            status_id: status._id,
            user_id: user_2._id,
        })
        try {
            await create({
                status_id: status._id,
                user_id: user_2._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(CreateErrorCodes.AlreadyFavorited)
            }
        }
        {
            const _status = (await get_status(
                {
                    status_id: status._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusSchema
            expect(_status).toBeInstanceOf(Status)
            expect(_status.favorite_count).toEqual(2)

            const favorite = (await get(
                {
                    status_id: status._id,
                    user_id: user_2._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusFavoritesSchema
            expect(favorite).toBeInstanceOf(StatusFavorites)
        }
        {
            const favorites = (await get({
                status_id: status._id,
            })) as StatusFavoritesSchema
            expect(favorites).toHaveLength(2)
        }

        await destroy({
            status_id: status._id,
            user_id: user_2._id,
        })
        {
            const _status = (await get_status(
                {
                    status_id: status._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusSchema
            expect(_status).toBeInstanceOf(Status)
            expect(_status.favorite_count).toEqual(1)

            const favorite = (await get(
                {
                    status_id: status._id,
                    user_id: user_2._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusFavoritesSchema
            expect(favorite).toBeNull()
        }

        await destroy({
            status_id: status._id,
            user_id: user_1._id,
        })
        {
            const _status = (await get_status(
                {
                    status_id: status._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusSchema
            expect(_status).toBeInstanceOf(Status)
            expect(_status.favorite_count).toEqual(0)

            const favorite = (await get(
                {
                    status_id: status._id,
                    user_id: user_1._id,
                },
                { disable_in_memory_cache: true }
            )) as StatusFavoritesSchema
            expect(favorite).toBeNull()
        }

        try {
            await destroy({
                status_id: status._id,
                user_id: user_2._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(DestroyErrorCodes.AlreadyUnfavorited)
            }
        }

        try {
            await destroy({
                status_id: status._id,
                user_id: user_1._id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(DestroyErrorCodes.AlreadyUnfavorited)
            }
        }
    })
})
