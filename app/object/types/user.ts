import { UserSchema, User } from "../../schema/user"
import { UserObject } from "../schema"
import { ObjectTransformationError } from "../error"

export const transform = async (
    model: UserSchema | null,
    auth_user: UserSchema | null
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
        muted: false,
        blocked: false,
        last_activity_time: model.last_activity_date
            ? model.last_activity_date.getTime()
            : null,
    }
}
