import { StatusSchema } from "../../schema/status"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { get as get_status } from "./get"
import { get as get_channel } from "../channel/get"
import mongoose from "mongoose"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
    StatusNotFound: "status_not_found",
}

type Argument = {
    status_id: StatusSchema["_id"]
}

export const destroy = async ({ status_id }: Argument): Promise<void> => {
    if (vs.object_id().ok(status_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgStatusId)
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const status = await get_status(
            { status_id },
            {
                transaction_session: session,
                disable_cache: true,
            }
        )
        if (status == null) {
            throw new ModelRuntimeError(ErrorCodes.StatusNotFound)
        }
        const { channel_id, thread_status_id, community_id } = status

        const channel = await get_channel(
            { channel_id },
            {
                transaction_session: session,
                disable_cache: true,
            }
        )
        if (channel) {
            channel.stats.statuses_count -= 1
            channel.updated_at = new Date()
            await channel.save()
        }

        if (thread_status_id) {
            const parent_status = await get_status(
                { status_id: thread_status_id },
                {
                    transaction_session: session,
                    disable_cache: true,
                }
            )
            if (parent_status) {
                parent_status.comment_count -= 1
                parent_status.updated_at = new Date()
                await parent_status.save()
            }
        }

        await status.remove()

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}
