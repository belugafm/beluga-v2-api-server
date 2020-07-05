import { ChannelSchema, Channel } from "../../schema/channel"
import { ChannelObject } from "../schema"
import { ObjectTransformationError } from "../error"
import * as mongo from "../../lib/mongoose"
import { User } from "../../schema/user"
import { transform as transform_user } from "./user"

export const transform = async (
    model: ChannelSchema | null
): Promise<ChannelObject | null> => {
    if (model === null) {
        return null
    }
    if (model instanceof Channel !== true) {
        throw new ObjectTransformationError()
    }
    return {
        id: model._id.toHexString(),
        name: model.name,
        description: model.description,
        stats: model.stats,
        created_at: model.created_at,
        creator_id: model.creator_id.toHexString(),
        creator: await transform_user(
            await mongo.findOne(User, { _id: model.creator_id })
        ),
        is_public: model.is_public,
        community_id: model.community_id
            ? model.community_id.toHexString()
            : null,
        community: null,
    }
}
