import {
    UserLoginSession,
    UserLoginSessionSchema,
} from "../../../schema/user_login_session"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"
import * as mongo from "../../../lib/mongoose"
import * as vs from "../../../validation"

export const ErrorCodes = {
    InvalidUserId: "invalid_arg_user_id",
    InvalidSessionId: "invalid_arg_session_id",
}

type Argument = {
    user_id: mongoose.Types.ObjectId
    session_id: UserLoginSessionSchema["session_id"]
}

export const get = async ({
    user_id,
    session_id,
}: Argument): Promise<UserLoginSessionSchema | null> => {
    if (vs.object_id().ok(user_id) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }
    if (vs.string().ok(session_id) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }
    return await mongo.findOne(UserLoginSession, {
        user_id,
        session_id,
    })
}
