import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import {
    StatusFavorites,
    StatusFavoritesSchema,
} from "../../../schema/status_favorites"
import { get as get_favorites } from "./get"
import { get as get_status } from "../get"
import { get as get_user } from "../../user/get"
import { get as get_blocks } from "../../user/blocks/get"
import mongoose from "mongoose"
import { UserBlocksSchema } from "../../../schema/user_blocks"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    InvalidArgUserId: "invalid_arg_user_id",
    StatusNotFound: "status_not_found",
    UserNotFound: "user_not_found",
    CannotCreateFavorite: "cannot_create_favorite",
    AlreadyFavorited: "already_favorited",
}

type Argument = {
    status_id: StatusFavoritesSchema["status_id"]
    user_id: StatusFavoritesSchema["user_id"]
}

export const create = async ({
    status_id,
    user_id,
}: Argument): Promise<StatusFavoritesSchema> => {
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

        const blocked = (await get_blocks(
            {
                auth_user_id: status.user_id,
                target_user_id: user_id,
            },
            { disable_cache: true }
        )) as UserBlocksSchema
        if (blocked) {
            throw new ModelRuntimeError(ErrorCodes.CannotCreateFavorite)
        }

        const already_favorited = (await get_favorites(
            {
                status_id,
                user_id,
            },
            { disable_cache: true }
        )) as StatusFavoritesSchema

        if (already_favorited) {
            throw new ModelRuntimeError(ErrorCodes.AlreadyFavorited)
        }
        status.favorite_count += 1
        await status.save()

        const favorite = await StatusFavorites.create({
            status_id: status_id,
            user_id: user_id,
            channel_id: status.channel_id,
            community_id: status.community_id ? status.community_id : null,
        })

        await session.commitTransaction()
        session.endSession()

        return favorite
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}
