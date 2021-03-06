import { ModelRuntimeError } from "../error"
import mongoose from "mongoose"
import * as vs from "../../validation"
import { get as get_user } from "../user/get"

export const ErrorCodes = {
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidArgDate: "invalid_arg_date",
}

type Argument = {
    user_id: mongoose.Types.ObjectId
    date: Date
}

export const update_last_activity_date = async ({
    user_id,
    date,
}: Argument): Promise<void> => {
    if (vs.object_id().ok(user_id) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    if (date instanceof Date === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgDate)
    }
    const user = await get_user({ user_id })
    if (user == null) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    user.last_activity_date = date
    await user.save()
}
