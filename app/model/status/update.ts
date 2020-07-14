import { StatusSchema, Status } from "../../schema/status"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"

export const ErrorCodes = {
    InvalidArgText: "invalid_arg_text",
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidArgChannelId: "invalid_arg_channel_id",
    InvalidArgCommunityId: "invalid_arg_community_id",
    InvalidArgIsPublic: "invalid_arg_is_public",
}

type Argument = {
    text: StatusSchema["text"]
    user_id: StatusSchema["user_id"]
    channel_id: StatusSchema["channel_id"]
    community_id: StatusSchema["community_id"]
    is_public: StatusSchema["is_public"]
}

export const update = async ({
    text,
    user_id,
    channel_id,
    community_id,
    is_public,
}: Argument): Promise<StatusSchema> => {
    if (vs.status.text().ok(text) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgText)
    }
    if (vs.object_id().ok(user_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    if (vs.object_id().ok(channel_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgChannelId)
    }
    if (community_id) {
        if (vs.object_id().ok(community_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgCommunityId)
        }
    }
    if (vs.boolean().ok(is_public) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgIsPublic)
    }
    return await Status.create({
        text: text,
        user_id: user_id,
        channel_id: channel_id,
        community_id: community_id ? community_id : null,
        is_public: is_public,
        is_deleted: false,
        is_edited: false,
        created_at: new Date(),
        likes: 0,
    })
}
