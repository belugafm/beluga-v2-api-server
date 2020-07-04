import {
    UserLoginSession,
    UserLoginSessionSchema,
} from "../../../schema/user_login_session"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"
import * as mongo from "../../../lib/mongoose"
import * as vs from "../../../validation"

export const ErrorCodes = {
    InvalidArgSessionId: "invalid_arg_session_id",
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidArgSessionToken: "invalid_arg_session_token",
}

type Argument = {
    session_id: mongoose.Types.ObjectId
}

export const get = async ({
    session_id,
}: Argument): Promise<UserLoginSessionSchema | null> => {
    if (vs.object_id().ok(session_id) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgSessionId)
    }
    return await mongo.findOne(UserLoginSession, { _id: session_id })
}
