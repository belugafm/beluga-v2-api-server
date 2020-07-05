import { UserSchema, User } from "../../schema/user"
import { UserObject } from "../schema"
import { ObjectTransformationError } from "../error"
import * as mongo from "../../lib/mongoose"

export const transform = async (
    model: UserSchema | null
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
        created_at: model.created_at,
        stats: model.stats,
        is_active: model.is_active,
        is_dormant: model.is_dormant,
        last_activity_date: model.last_activity_date,
    }
}
