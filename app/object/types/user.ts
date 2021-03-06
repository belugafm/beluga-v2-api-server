import { UserSchema, User } from "../../schema/user"
import { UserObject } from "../schema"
import { ObjectTransformationError } from "../error"
import { muted } from "./user/mutes"
import { blocked } from "./user/blocked"

export type TransformOption = {
    disable_cache: boolean
}

export const transform = async (
    model: UserSchema | null,
    auth_user: UserSchema | null,
    options: TransformOption = { disable_cache: false }
): Promise<UserObject | null> => {
    if (model === null) {
        return null
    }
    if (model instanceof User !== true) {
        throw new ObjectTransformationError()
    }
    return {
        id: model._id.toHexString(),
        name: model.name,
        display_name: model.display_name,
        profile: model.profile,
        created_at: model.created_at.getTime(),
        stats: model.stats,
        active: model.active,
        dormant: model.dormant,
        muted: await muted(model, auth_user, options.disable_cache),
        blocked: await blocked(model, auth_user, options.disable_cache),
        last_activity_time: model.last_activity_date
            ? model.last_activity_date.getTime()
            : null,
    }
}

export const user_object_cache = {
    on: () => {
        muted._cache.on()
    },
    off: async () => {
        await muted._cache.off()
    },
}
