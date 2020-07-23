import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import * as mongo from "../../../lib/mongoose"
import { UserMutesSchema, UserMutes } from "../../../schema/user_mutes"
import { ClientSession } from "mongoose"
import { DefaultOptions, GetOptions } from "../../options"

export const ErrorCodes = {
    InvalidArgAuthUserId: "invalid_arg_auth_user_id",
    InvalidArgTargetUserId: "invalid_arg_target_user_id",
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
        throw new ModelRuntimeError(ErrorCodes.InvalidArgAuthUserId)
    }
    if (target_user_id) {
        if (vs.object_id().ok(target_user_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgTargetUserId)
        }
        return await mongo.findOne(
            UserMutes,
            { user_id: auth_user_id, target_user_id: target_user_id },
            {
                transaction_session: options.transaction_session,
                disable_cache: options.disable_cache,
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
