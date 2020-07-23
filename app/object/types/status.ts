import { StatusSchema, Status } from "../../schema/status"
import { StatusObject, UserObject } from "../schema"
import { ObjectTransformationError } from "../error"
import { UserSchema } from "../../schema/user"
import { transform as transform_user } from "./user"
import { transform as transform_channel } from "./channel"
import { StatusLikesSchema } from "../../schema/status_likes"
import { StatusFavoritesSchema } from "../../schema/status_favorites"
import { get as get_favorites } from "../../model/status/favorites/get"
import { get as get_likes } from "../../model/status/likes/get"
import { get as get_user } from "../../model/user/get"
import { get as get_channel } from "../../model/channel/get"
import { InMemoryCache } from "../../lib/cache"
import { favorited } from "./status/favorited"
import config from "../../config/app"

class ObjectCache extends InMemoryCache {
    on() {
        this.change_streams.push(
            Status.watch().on("change", (event) => {
                if (
                    event.operationType == "delete" ||
                    event.operationType == "update"
                ) {
                    const { _id } = event.documentKey
                    if (_id) {
                        this.delete(_id as string)
                    }
                }
            })
        )
    }
}

const object_cache = new ObjectCache(
    config.in_memory_cache.cache_limit,
    config.in_memory_cache.default_expire_seconds
)

function remove_null(array: (UserObject | null)[]): UserObject[] {
    return array.filter((user) => user != null) as UserObject[]
}

async function likes_users(status: StatusSchema, auth_user: UserSchema | null) {
    const all_likes = await (async (
        status: StatusSchema
    ): Promise<StatusLikesSchema[]> => {
        const key = "likes"
        const [_likes, is_cached] = object_cache.get(
            status._id.toHexString(),
            key
        )
        if (is_cached) {
            return _likes
        }
        const likes = (await get_likes({
            status_id: status._id,
        })) as StatusLikesSchema[]
        object_cache.set(status._id.toHexString(), key, likes)
        return likes
    })(status)

    return remove_null(
        await Promise.all(
            all_likes.map(async (likes) => {
                return await transform_user(
                    await get_user({ user_id: likes.user_id }),
                    auth_user
                )
            })
        )
    )
}

async function favorites_users(
    status: StatusSchema,
    auth_user: UserSchema | null
) {
    const all_favorites = await (async (
        status: StatusSchema
    ): Promise<StatusFavoritesSchema[]> => {
        const key = "favorites"
        const [_favorites, is_cached] = object_cache.get(
            status._id.toHexString(),
            key
        )
        if (is_cached) {
            return _favorites
        }
        const favorites = (await get_favorites({
            status_id: status._id,
        })) as StatusFavoritesSchema[]
        object_cache.set(status._id.toHexString(), key, favorites)
        return favorites
    })(status)
    return remove_null(
        await Promise.all(
            all_favorites.map(async (likes) => {
                return await transform_user(
                    await get_user({ user_id: likes.user_id }),
                    auth_user
                )
            })
        )
    )
}

export const transform = async (
    model: StatusSchema | null,
    auth_user: UserSchema | null
): Promise<StatusObject | null> => {
    if (model === null) {
        return null
    }
    if (model instanceof Status !== true) {
        throw new ObjectTransformationError()
    }
    return {
        id: model._id.toHexString(),
        text: model.text,
        user_id: model.user_id.toHexString(),
        user: await transform_user(
            await get_user({ user_id: model.user_id }),
            auth_user
        ),
        channel_id: model.channel_id.toHexString(),
        channel: await transform_channel(
            await get_channel({ channel_id: model.channel_id }),
            auth_user
        ),
        community_id: model.community_id
            ? model.community_id.toHexString()
            : null,
        community: null,
        created_at: model.created_at.getTime(),
        public: model.public,
        edited: model.edited,
        favorited: await favorited(model, auth_user),
        likes: {
            count: model.like_count,
            users: await likes_users(model, auth_user),
        },
        favorites: {
            count: model.favorite_count,
            users: await favorites_users(model, auth_user),
        },
    }
}

export const status_object_cache = {
    on: () => {
        object_cache.on()
        favorited._cache.on()
    },
    off: async () => {
        await object_cache.off()
        await favorited._cache.off()
    },
}
