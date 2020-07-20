import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { get as get_mutes } from "./get"
import { get as get_user } from "../user/get"
import { UserMutesSchema } from "../../schema/user_mutes"

export const ErrorCodes = {
    InvalidArgAuthUserId: "invalid_arg_auth_user_id",
    InvalidArgTargetUserId: "invalid_arg_target_user_id",
    AuthUserNotFound: "auth_user_not_found",
    TargetUserNotFound: "target_user_not_found",
    CannotUnmuteSelf: "cannot_unmute_self",
    AlreadyUnmuted: "already_unmuted",
}

type Argument = {
    auth_user_id: UserMutesSchema["user_id"]
    target_user_id: UserMutesSchema["target_user_id"]
}

export const destroy = async ({
    target_user_id,
    auth_user_id,
}: Argument): Promise<void> => {
    if (vs.object_id().ok(auth_user_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgAuthUserId)
    }
    if (vs.object_id().ok(target_user_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgTargetUserId)
    }

    const auth_user = await get_user({
        user_id: auth_user_id,
    })
    if (auth_user == null) {
        throw new ModelRuntimeError(ErrorCodes.AuthUserNotFound)
    }

    const target_user = await get_user({
        user_id: target_user_id,
    })
    if (target_user == null) {
        throw new ModelRuntimeError(ErrorCodes.TargetUserNotFound)
    }

    if (auth_user._id.equals(target_user._id)) {
        throw new ModelRuntimeError(ErrorCodes.CannotUnmuteSelf)
    }

    const mute = (await get_mutes(
        {
            auth_user_id,
            target_user_id,
        },
        { disable_in_memory_cache: true }
    )) as UserMutesSchema

    if (mute == null) {
        throw new ModelRuntimeError(ErrorCodes.AlreadyUnmuted)
    }
    await mute.remove()
}
