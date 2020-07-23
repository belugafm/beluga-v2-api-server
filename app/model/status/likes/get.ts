import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import * as mongo from "../../../lib/mongoose"
import { StatusLikesSchema, StatusLikes } from "../../../schema/status_likes"
import { ClientSession } from "mongoose"
import { DefaultOptions, GetOptions } from "../../options"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    InvalidArgUserId: "invalid_arg_user_id",
} as const

type Argument = {
    status_id: StatusLikesSchema["status_id"]
    user_id?: StatusLikesSchema["user_id"]
    transaction_session?: ClientSession
}

export const get = async (
    { status_id, user_id }: Argument,
    options: GetOptions = DefaultOptions
): Promise<StatusLikesSchema | StatusLikesSchema[] | null> => {
    if (vs.object_id().ok(status_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgStatusId)
    }
    if (user_id) {
        if (vs.object_id().ok(user_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
        }
        return await mongo.findOne(
            StatusLikes,
            { status_id, user_id },
            {
                transaction_session: options.transaction_session,
                disable_cache: options.disable_cache,
            }
        )
    } else {
        return await mongo.find(StatusLikes, { status_id }, (query) => {
            return query.session(
                options.transaction_session ? options.transaction_session : null
            )
        })
    }
}
