import { ChannelSchema, Channel } from "../../schema/channel"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import config from "../../config/app"

export const ErrorCodes = {
    InvalidArgName: "invalid_arg_name",
    InvalidArgDescription: "invalid_arg_description",
    InvalidArgCreatorId: "invalid_arg_creator_id",
    InvalidArgCommunityId: "invalid_arg_community_id",
    InvalidArgIsPublic: "invalid_arg_is_public",
    LimitReached: "limit_reached",
}

type Argument = {
    name: ChannelSchema["name"]
    is_public: ChannelSchema["is_public"]
    creator_id: ChannelSchema["creator_id"]
    community_id?: ChannelSchema["community_id"]
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
    if (community_id) {
        if (vs.object_id().ok(community_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgCommunityId)
        }
    }
    if (description) {
        if (vs.channel.description().ok(description) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgDescription)
        }
    }
    if (vs.boolean().ok(is_public) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgIsPublic)
    }
    const my_channels = await mongo.find(Channel, {
        creator_id: creator_id,
        created_at: {
            $gte: new Date(Date.now() - 86400 * 1000),
        },
    })
    if (my_channels.length >= config.channel.create_limit_per_day) {
        throw new ModelRuntimeError(ErrorCodes.LimitReached)
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
