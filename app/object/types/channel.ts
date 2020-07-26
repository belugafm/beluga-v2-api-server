import { ChannelSchema, Channel } from "../../schema/channel"
import { ChannelObject } from "../schema"
import { ObjectTransformationError } from "../error"
import * as mongo from "../../lib/mongoose"
import { User, UserSchema } from "../../schema/user"
import { transform as transform_user } from "./user"

export type TransformOption = {
    disable_cache: boolean
}

export const transform = async (
    model: ChannelSchema | null,
    auth_user: UserSchema | null,
    options: TransformOption = { disable_cache: false }
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
        created_at: model.created_at.getTime(),
        creator_id: model.creator_id.toHexString(),
        creator: await transform_user(
            await mongo.findOne(
                User,
                { _id: model.creator_id },
                { disable_cache: options.disable_cache }
            ),
            auth_user,
            { disable_cache: options.disable_cache }
        ),
        public: model.public,
        community_id: model.community_id
            ? model.community_id.toHexString()
            : null,
        community: null,
    }
}
