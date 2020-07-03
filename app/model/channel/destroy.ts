import { ChannelSchema, Channel } from "../../schema/channel"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { get } from "./get"

export const ErrorCodes = {
    InvalidArgChannelId: "invalid_arg_channel_id",
    InvalidArgCreatorId: "invalid_arg_creator_id",
    ChannelNotFound: "channel_not_found",
    NoPermission: "no_permission",
}

type Argument = {
    channel_id: ChannelSchema["creator_id"]
    creator_id: ChannelSchema["creator_id"]
}

export const destroy = async ({
    channel_id,
    creator_id,
}: Argument): Promise<void> => {
    if (vs.object_id().ok(channel_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgChannelId)
    }
    if (vs.object_id().ok(creator_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgCreatorId)
    }
    const channel = await get({ channel_id })
    if (channel == null) {
        throw new ModelRuntimeError(ErrorCodes.ChannelNotFound)
    }
    if (channel.creator_id.equals(creator_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.NoPermission)
    }
    await channel.remove()
}
