import { StatusSchema, Status } from "../../../schema/status"
import { UserSchema } from "../../../schema/user"
import {
    StatusFavoritesSchema,
    StatusFavorites,
} from "../../../schema/status_favorites"
import { get as get_favorites } from "../../../model/status/favorites/get"
import { InMemoryCache } from "../../../lib/cache"
import config from "../../../config/app"

class DocumentCache extends InMemoryCache {
    on() {
        this.change_streams.push(
            StatusFavorites.watch([], { fullDocument: "updateLookup" }).on(
                "change",
                (event) => {
                    console.log(event)
                }
            )
        )
    }
    async off() {
        await Promise.all(this.change_streams.map((stream) => stream.close()))
    }
}

const cache = new DocumentCache(
    config.in_memory_cache.cache_limit,
    config.in_memory_cache.default_expire_seconds
)

const map = new InMemoryCache(
    config.in_memory_cache.cache_limit,
    config.in_memory_cache.default_expire_seconds
)

function _get_cached_value(
    status: StatusSchema,
    auth_user: UserSchema
): boolean | null {
    const namespace = auth_user._id.toHexString()
    const lookup_key = status._id.toHexString()
    const [document_id, is_cached] = map.get(namespace, lookup_key)
    if (is_cached !== true) {
        return null
    }
    if (document_id === null) {
        return false
    }
    {
        const namespace = document_id.toHexString()
        const key = document_id.toHexString()
        const [document] = cache.get(namespace, key)
        if (document == null) {
            return null
        }
        return true
    }
}

async function _favorited(
    status: StatusSchema,
    auth_user: UserSchema | null
): Promise<boolean> {
    if (auth_user == null) {
        return false
    }
    const favorited = _get_cached_value(status, auth_user)
    if (favorited !== null) {
        return favorited
    }
    const document = (await get_favorites({
        status_id: status._id,
        user_id: auth_user._id,
    })) as StatusFavoritesSchema | null
    const document_id = document == null ? null : document._id
    {
        const namespace = auth_user._id.toHexString()
        const lookup_key = status._id.toHexString()
        map.set(namespace, lookup_key, document_id)
    }
    if (document_id) {
        const namespace = document_id.toHexString()
        const key = document_id.toHexString()
        cache.set(namespace, key, document)
    }
    return document_id !== null
}

_favorited.cache = cache

export const favorited = _favorited
