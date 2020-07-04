import { ChannelSchema, Channel } from "../../schema/channel"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { get } from "./get"

export const ErrorCodes = {
    InvalidArgChannelId: "invalid_arg_channel_id",
    ChannelNotFound: "channel_not_found",
}

type Argument = {
    channel_id: ChannelSchema["creator_id"]
}

export const destroy = async ({ channel_id }: Argument): Promise<void> => {
    if (vs.object_id().ok(channel_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgChannelId)
    }
    const channel = await get({ channel_id })
    if (channel == null) {
        throw new ModelRuntimeError(ErrorCodes.ChannelNotFound)
    }
    await channel.remove()
}
