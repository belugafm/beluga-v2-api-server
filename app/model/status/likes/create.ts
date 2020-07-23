import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import { StatusLikes, StatusLikesSchema } from "../../../schema/status_likes"
import { get as get_likes } from "./get"
import { get as get_status } from "../get"
import { get as get_user } from "../../user/get"
import { get as get_blocks } from "../../user/blocks/get"
import config from "../../../config/app"
import mongoose from "mongoose"
import { UserBlocksSchema } from "../../../schema/user_blocks"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    InvalidArgUserId: "invalid_arg_user_id",
    StatusNotFound: "status_not_found",
    UserNotFound: "user_not_found",
    CannotCreateLike: "cannot_create_like",
    LimitReached: "limit_reached",
}

type Argument = {
    status_id: StatusLikesSchema["status_id"]
    user_id: StatusLikesSchema["user_id"]
}

export const create = async ({
    status_id,
    user_id,
}: Argument): Promise<StatusLikesSchema> => {
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

        if (status.user_id.equals(user._id)) {
            throw new ModelRuntimeError(ErrorCodes.CannotCreateLike)
        }

        const blocked = (await get_blocks(
            {
                auth_user_id: status.user_id,
                target_user_id: user_id,
            },
            { disable_cache: true }
        )) as UserBlocksSchema
        if (blocked) {
            throw new ModelRuntimeError(ErrorCodes.CannotCreateLike)
        }

        const likes = (await get_likes(
            {
                status_id,
                user_id,
            },
            { transaction_session: session }
        )) as StatusLikesSchema

        if (likes) {
            if (likes.count >= config.status.like.max_count) {
                throw new ModelRuntimeError(ErrorCodes.LimitReached)
            }
            likes.count += 1
            await likes.save()

            status.like_count += 1
            await status.save()

            await session.commitTransaction()
            session.endSession()

            return likes
        } else {
            status.like_count += 1
            await status.save()

            const likes = await StatusLikes.create({
                status_id: status_id,
                user_id: user_id,
                channel_id: status.channel_id,
                community_id: status.community_id ? status.community_id : null,
                count: 1,
            })

            await session.commitTransaction()
            session.endSession()

            return likes
        }
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}
