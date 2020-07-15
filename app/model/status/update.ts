import { StatusSchema, Status } from "../../schema/status"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { get as get_user } from "../user/get"
import { get as get_channel } from "../channel/get"

export const ErrorCodes = {
    InvalidArgText: "invalid_arg_text",
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidArgChannelId: "invalid_arg_channel_id",
    UserNotFound: "user_not_found",
    ChannelNotFound: "channel_not_found",
}

type Argument = {
    text: StatusSchema["text"]
    user_id: StatusSchema["user_id"]
    channel_id: StatusSchema["channel_id"]
}

export const update = async ({
    text,
    user_id,
    channel_id,
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
    const user = await get_user({ user_id })
    if (user == null) {
        throw new ModelRuntimeError(ErrorCodes.UserNotFound)
    }
    const channel = await get_channel({ channel_id })
    if (channel == null) {
        throw new ModelRuntimeError(ErrorCodes.ChannelNotFound)
    }

    return await Status.create({
        text: text,
        user_id: user_id,
        channel_id: channel_id,
        community_id: channel.community_id,
        is_public: channel.is_public,
        is_deleted: false,
        is_edited: false,
        created_at: new Date(),
        like_count: 0,
        favorite_count: 0,
    })
}
