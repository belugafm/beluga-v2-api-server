import { ModelRuntimeError } from "../error"
import mongoose, { ClientSession } from "mongoose"
import * as vs from "../../validation"
import { get as get_user } from "../user/get"

export const ErrorCodes = {
    InvalidUserId: "invalid_arg_user_id",
    InvalidDate: "invalid_arg_date",
    InvalidVersion: "invalid_arg_version",
}

type Argument = {
    user_id: mongoose.Types.ObjectId
    date: Date
    version: string
    session?: ClientSession
}

export const agree_to = async ({
    user_id,
    date,
    version,
    session,
}: Argument): Promise<void> => {
    if (vs.object_id().ok(user_id) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }
    if (date instanceof Date === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidDate)
    }
    if (vs.string().ok(version) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidVersion)
    }
    const user = await get_user({ user_id, session })
    if (user == null) {
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }

    user._terms_of_service_agreement_date = date
    user._terms_of_service_agreement_version = version
    await user.save()
}
