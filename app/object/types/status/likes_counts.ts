import { StatusSchema, Status } from "../../../schema/status"
import { UserObject } from "../../schema"
import { UserSchema } from "../../../schema/user"
import { transform as transform_user } from "../user"
import { StatusLikesSchema } from "../../../schema/status_likes"
import { get as get_likes } from "../../../model/status/likes/get"
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

function remove_null(
    array: {
        count: number
        user: UserObject | null
    }[]
): {
    count: number
    user: UserObject
}[] {
    return array.filter((item) => item.user != null) as {
        count: number
        user: UserObject
    }[]
}
async function get(status: StatusSchema): Promise<StatusLikesSchema[]> {
    const namespace = status._id.toHexString()
    const key = status._id.toHexString()
    {
        const [likes, is_cached] = cache.get(namespace, key)
        if (is_cached) {
            return likes
        }
    }
    {
        const likes = (await get_likes({
            status_id: status._id,
        })) as StatusLikesSchema[]
        cache.set(namespace, key, likes)
        return likes
    }
}

async function _likes_counts(
    status: StatusSchema,
    auth_user: UserSchema | null,
    disable_cache: boolean = false
) {
    const likes = await get(status)
    return remove_null(
        await Promise.all(
            likes.map(async (like) => {
                return {
                    count: like.count,
                    user: await transform_user(
                        await get_user({ user_id: like.user_id }),
                        auth_user,
                        { disable_cache }
                    ),
                }
            })
        )
    )
}

_likes_counts._cache = cache
export const likes_counts = _likes_counts
