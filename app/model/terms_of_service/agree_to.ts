import { ModelRuntimeError } from "../error"
import mongoose, { ClientSession } from "mongoose"
import * as vs from "../../validation"
import { get as get_user } from "../user/get"

export const ErrorCodes = {
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidArgDate: "invalid_arg_date",
    InvalidArgVersion: "invalid_arg_version",
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
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    if (date instanceof Date === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgDate)
    }
    if (vs.string().ok(version) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgVersion)
    }
    const user = await get_user({ user_id, session })
    if (user == null) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }

    user._terms_of_service_agreement_date = date
    user._terms_of_service_agreement_version = version
    await user.save()
}
