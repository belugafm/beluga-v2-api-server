import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import {
    StatusFavorites,
    StatusFavoritesSchema,
} from "../../../schema/status_favorites"
import { get as get_favorites } from "./get"
import { get as get_status } from "../get"
import { get as get_user } from "../../user/get"
import config from "../../../config/app"
import mongoose from "mongoose"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    InvalidArgUserId: "invalid_arg_user_id",
    StatusNotFound: "status_not_found",
    UserNotFound: "user_not_found",
    AlreadyUnfavorited: "already_unfavorited",
}

type Argument = {
    status_id: StatusFavoritesSchema["status_id"]
    user_id: StatusFavoritesSchema["user_id"]
}

export const destroy = async ({
    status_id,
    user_id,
}: Argument): Promise<void> => {
    if (vs.object_id().ok(status_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgStatusId)
    }
    if (vs.object_id().ok(user_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const status = await get_status(
            {
                status_id,
            },
            { transaction_session: session }
        )
        if (status == null) {
            throw new ModelRuntimeError(ErrorCodes.StatusNotFound)
        }

        const user = await get_user({
            user_id,
        })
        if (user == null) {
            throw new ModelRuntimeError(ErrorCodes.UserNotFound)
        }

        const favorite = (await get_favorites(
            {
                status_id,
                user_id,
            },
            { disable_cache: true }
        )) as StatusFavoritesSchema

        if (favorite == null) {
            throw new ModelRuntimeError(ErrorCodes.AlreadyUnfavorited)
        }
        await favorite.remove()

        status.favorite_count -= 1
        status.updated_at = new Date()
        await status.save()

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}
