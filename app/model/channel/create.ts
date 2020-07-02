import { ChannelSchema, Channel } from "../../schema/channel"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"

export const ErrorCodes = {
    InvalidArgName: "invalid_arg_name",
    InvalidArgDescription: "invalid_arg_description",
    InvalidArgCreatorId: "invalid_arg_description",
    InvalidArgCommunityId: "invalid_arg_community_id",
    InvalidArgIsPublic: "invalid_arg_is_public",
}

type Argument = {
    name: ChannelSchema["name"]
    is_public: ChannelSchema["is_public"]
    creator_id: ChannelSchema["creator_id"]
    community_id: ChannelSchema["community_id"]
    description?: ChannelSchema["description"]
}

export const create = async ({
    name,
    description,
    creator_id,
    community_id,
    is_public,
}: Argument): Promise<ChannelSchema> => {
    if (vs.channel.name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgName)
    }
    if (vs.object_id().ok(creator_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgName)
    }
    if (vs.optional_object_id().ok(community_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgCommunityId)
    }
    if (description) {
        if (vs.channel.description().ok(description) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgDescription)
        }
    }
    if (vs.boolean().ok(is_public) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgIsPublic)
    }
    return await Channel.create({
        name: name,
        description: description || null,
        stats: {},
        created_at: new Date(),
        creator_id: creator_id,
        community_id: community_id,
        is_public: is_public,
    })
}
