import { UserLoginSessionSchema } from "../../../schema/user_login_session"
import { ModelRuntimeError } from "../../error"
import * as vs from "../../../validation"
import { get } from "../../../model/user/login_session/get"

export const ErrorCodes = {
    InvalidArgSessionId: "invalid_arg_session_id",
    SessionNotFound: "session_not_found",
}

type Argument = {
    session_id: UserLoginSessionSchema["_id"]
}

export const invalidate = async ({ session_id }: Argument): Promise<void> => {
    if (vs.object_id().ok(session_id) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgSessionId)
    }
    const session = await get({ session_id })
    if (session == null) {
        throw new ModelRuntimeError(ErrorCodes.SessionNotFound)
    }
    session.is_expired = true
    await session.save()
}
