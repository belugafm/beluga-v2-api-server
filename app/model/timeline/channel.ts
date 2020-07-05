import { StatusSchema, Status } from "../../schema/status"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import mongoose from "mongoose"

export const ErrorCodes = {
    InvalidArgChannelId: "invalid_arg_channel_id",
} as const

type Argument = {
    channel_id: mongoose.Types.ObjectId
    since_id?: mongoose.Types.ObjectId
    max_id?: mongoose.Types.ObjectId
    since_date?: Date
    until_date?: Date
}

export const channel = async ({
    channel_id,
    since_id,
    max_id,
    since_date,
    until_date,
}: Argument): Promise<StatusSchema[]> => {
    if (vs.object_id().ok(channel_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgChannelId)
    }
    return await mongo.find(Status, { channel_id: channel_id }, (query) => {
        return query.sort({ created_at: -1 })
    })
}
