import { StatusSchema, Status } from "../../../schema/status"
import { UserObject } from "../../schema"
import { UserSchema } from "../../../schema/user"
import { transform as transform_user } from "../user"
import { StatusFavoritesSchema } from "../../../schema/status_favorites"
import { get as get_favorites } from "../../../model/status/favorites/get"
import { get as get_user } from "../../../model/user/get"
import { InMemoryCache } from "../../../lib/cache"
import config from "../../../config/app"

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

const cache = new ObjectCache(
    config.in_memory_cache.cache_limit,
    config.in_memory_cache.default_expire_seconds
)

function remove_null(array: (UserObject | null)[]): UserObject[] {
    return array.filter((user) => user != null) as UserObject[]
}

async function get(
    status: StatusSchema,
    disable_cache: boolean = false
): Promise<StatusFavoritesSchema[]> {
    const namespace = status._id.toHexString()
    const key = status._id.toHexString()
    if (disable_cache === false) {
        const [favorites, is_cached] = cache.get(namespace, key)
        if (is_cached) {
            return favorites
        }
    }
    const favorites = (await get_favorites({
        status_id: status._id,
    })) as StatusFavoritesSchema[]
    cache.set(namespace, key, favorites)
    return favorites
}

async function _favorites_users(
    status: StatusSchema,
    auth_user: UserSchema | null,
    disable_cache: boolean = false
) {
    const all_favorites = await get(status, disable_cache)
    return remove_null(
        await Promise.all(
            all_favorites.map(async (likes) => {
                return await transform_user(
                    await get_user(
                        { user_id: likes.user_id },
                        { disable_cache }
                    ),
                    auth_user,
                    { disable_cache }
                )
            })
        )
    )
}

_favorites_users._cache = cache
export const favorites_users = _favorites_users
