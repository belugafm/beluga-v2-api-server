import { StatusSchema, Status } from "../../schema/status"
import { StatusObject } from "../schema"
import { ObjectTransformationError } from "../error"
import * as mongo from "../../lib/mongoose"
import { User } from "../../schema/user"
import { transform as transform_user } from "./user"

export const transform = async (
    model: StatusSchema | null
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
            await mongo.findOne(User, { _id: model.user_id })
        ),
        channel_id: model.channel_id.toHexString(),
        channel: null,
        community_id: model.community_id
            ? model.community_id.toHexString()
            : null,
        community: null,
        created_at: model.created_at,
        is_public: model.is_public,
        is_deleted: model.is_deleted,
        is_edited: model.is_edited,
    }
}
