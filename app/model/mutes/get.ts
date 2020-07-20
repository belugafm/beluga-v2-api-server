import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import { UserMutesSchema, UserMutes } from "../../schema/user_mutes"
import { ClientSession } from "mongoose"
import { DefaultOptions, GetOptions } from "../options"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    InvalidArgUserId: "invalid_arg_user_id",
} as const

type Argument = {
    auth_user_id: UserMutesSchema["user_id"]
    target_user_id?: UserMutesSchema["target_user_id"]
    transaction_session?: ClientSession
}

export const get = async (
    { auth_user_id, target_user_id }: Argument,
    options: GetOptions = DefaultOptions
): Promise<UserMutesSchema | UserMutesSchema[] | null> => {
    if (vs.object_id().ok(auth_user_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgStatusId)
    }
    if (target_user_id) {
        if (vs.object_id().ok(target_user_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
        }
        return await mongo.findOne(
            UserMutes,
            { user_id: auth_user_id, target_user_id: target_user_id },
            {
                transaction_session: options.transaction_session,
                disable_in_memory_cache: options.disable_in_memory_cache,
            }
        )
    } else {
        return await mongo.find(
            UserMutes,
            { user_id: auth_user_id },
            (query) => {
                return query.session(
                    options.transaction_session
                        ? options.transaction_session
                        : null
                )
            }
        )
    }
}
