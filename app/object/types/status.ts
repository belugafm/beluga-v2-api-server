import { StatusSchema, Status } from "../../schema/status"
import { StatusObject, UserObject } from "../schema"
import { ObjectTransformationError } from "../error"
import { UserSchema } from "../../schema/user"
import { transform as transform_user } from "./user"
import { transform as transform_channel } from "./channel"
import { get as get_user } from "../../model/user/get"
import { get as get_channel } from "../../model/channel/get"
import { get as get_status } from "../../model/status/get"
import { InMemoryCache } from "../../lib/cache"
import { favorited } from "./status/favorited"
import { likes_counts } from "./status/likes_counts"
import { favorites_users } from "./status/favorites_users"
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

async function transform_entities(
    status: StatusSchema,
    auth_user: UserSchema | null
): Promise<StatusObject["entities"]> {
    return {
        channels: await Promise.all(
            status.entities.channels.map(async (entity) => {
                const channel = await get_channel({
                    channel_id: entity.channel_id,
                })
                return {
                    channel_id: entity.channel_id.toHexString(),
                    channel: await transform_channel(channel, auth_user),
                    indices: entity.indices,
                }
            })
        ),
        statuses: await Promise.all(
            status.entities.statuses.map(async (entity) => {
                const status = await get_status({
                    status_id: entity.status_id,
                })
                return {
                    status_id: entity.status_id.toHexString(),
                    status: await transform(status, auth_user),
                    indices: entity.indices,
                }
            })
        ),
    }
}

export const transform = async (
    model: StatusSchema | null,
    auth_user: UserSchema | null,
    options: {
        transform_entities: boolean
    } = {
        transform_entities: true,
    }
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
        entities: options.transform_entities
            ? await transform_entities(model, auth_user)
            : { channels: [], statuses: [] },
        likes: {
            count: model.like_count,
            counts: await likes_counts(model, auth_user),
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
        likes_counts._cache.on()
        favorites_users._cache.on()
    },
    off: async () => {
        await object_cache.off()
        await favorited._cache.off()
        await likes_counts._cache.off()
        await favorites_users._cache.off()
    },
}
