import { ChannelSchema, Channel } from "../../schema/channel"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import { DefaultOptions, GetOptions } from "../options"

export const ErrorCodes = {
    InvalidArgChannelId: "invalid_arg_channel_id",
} as const

type Argument = {
    channel_id: ChannelSchema["_id"]
}

export const get = async (
    { channel_id }: Argument,
    options: GetOptions = DefaultOptions
): Promise<ChannelSchema | null> => {
    if (vs.object_id().ok(channel_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgChannelId)
    }
    return await mongo.findOne(
        Channel,
        { _id: channel_id },
        {
            transaction_session: options.transaction_session,
            disable_cache: options.disable_cache,
        }
    )
}
