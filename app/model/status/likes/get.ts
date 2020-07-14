import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import * as mongo from "../../../lib/mongoose"
import { StatusLikesSchema, StatusLikes } from "../../../schema/status_likes"
import { ClientSession } from "mongoose"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    InvalidArgUserId: "invalid_arg_user_id",
} as const

type Argument = {
    status_id: StatusLikesSchema["status_id"]
    user_id?: StatusLikesSchema["user_id"]
    transaction_session?: ClientSession
}

export const get = async ({
    status_id,
    user_id,
    transaction_session,
}: Argument): Promise<StatusLikesSchema | StatusLikesSchema[] | null> => {
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
                transaction_session: transaction_session,
                disable_in_memory_cache: transaction_session ? true : false,
            }
        )
    } else {
        return await mongo.find(StatusLikes, { status_id }, (query) => {
            return query.session(
                transaction_session ? transaction_session : null
            )
        })
    }
}
