import { UserSchema } from "../../../schema/user"
import { get as get_mutes } from "../../../model/user/mutes/get"
import { InMemoryCache } from "../../../lib/cache"
import config from "../../../config/app"
import { UserMutes, UserMutesSchema } from "../../../schema/user_mutes"

class DocumentCache extends InMemoryCache {
    on() {
        this.change_streams.push(
            UserMutes.watch().on("change", (event) => {
                if (event.operationType == "delete") {
                    const { _id } = event.documentKey
                    if (_id) {
                        this.delete(_id as string)
                    }
                }
                if (
                    event.operationType == "insert" ||
                    event.operationType == "update"
                ) {
                    const { fullDocument } = event
                    if (fullDocument) {
                        const { _id, user_id, target_user_id } = fullDocument
                        {
                            const namespace = user_id.toHexString()
                            const key = target_user_id.toHexString()
                            map.delete(namespace, key)
                        }
                        {
                            const namespace = _id.toHexString()
                            this.delete(namespace)
                        }
                    }
                }
            })
        )
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

export function get_cached_value(
    target_user: UserSchema,
    auth_user: UserSchema
): boolean | null {
    const namespace = auth_user._id.toHexString()
    const lookup_key = target_user._id.toHexString()
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

async function _muted(
    target_user: UserSchema,
    auth_user: UserSchema | null,
    disable_cache: boolean = false
): Promise<boolean> {
    if (auth_user == null) {
        return false
    }
    if (disable_cache !== true) {
        const muted = get_cached_value(target_user, auth_user)
        if (muted !== null) {
            return muted
        }
    }
    const document = (await get_mutes({
        target_user_id: target_user._id,
        auth_user_id: auth_user._id,
    })) as UserMutesSchema | null
    const document_id = document == null ? null : document._id
    {
        const namespace = auth_user._id.toHexString()
        const lookup_key = target_user._id.toHexString()
        map.set(namespace, lookup_key, document_id)
    }
    if (document_id) {
        const namespace = document_id.toHexString()
        const key = document_id.toHexString()
        cache.set(namespace, key, document)
    }
    return document_id !== null
}

_muted._map = map
_muted._cache = cache

export const muted = _muted
