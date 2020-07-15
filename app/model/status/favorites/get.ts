import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import * as mongo from "../../../lib/mongoose"
import {
    StatusFavoritesSchema,
    StatusFavorites,
} from "../../../schema/status_favorites"
import { ClientSession } from "mongoose"
import { DefaultOptions, GetOptions } from "../../options"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    InvalidArgUserId: "invalid_arg_user_id",
} as const

type Argument = {
    status_id: StatusFavoritesSchema["status_id"]
    user_id?: StatusFavoritesSchema["user_id"]
    transaction_session?: ClientSession
}

export const get = async (
    { status_id, user_id }: Argument,
    options: GetOptions = DefaultOptions
): Promise<StatusFavoritesSchema | StatusFavoritesSchema[] | null> => {
    if (vs.object_id().ok(status_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgStatusId)
    }
    if (user_id) {
        if (vs.object_id().ok(user_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
        }
        return await mongo.findOne(
            StatusFavorites,
            { status_id, user_id },
            {
                transaction_session: options.transaction_session,
                disable_in_memory_cache: options.disable_in_memory_cache,
            }
        )
    } else {
        return await mongo.find(StatusFavorites, { status_id }, (query) => {
            return query.session(
                options.transaction_session ? options.transaction_session : null
            )
        })
    }
}
