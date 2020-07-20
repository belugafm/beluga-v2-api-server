import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import { UserMutes, UserMutesSchema } from "../../../schema/user_mutes"
import { get as get_mutes } from "./get"
import { get as get_user } from "../get"

export const ErrorCodes = {
    InvalidArgAuthUserId: "invalid_arg_auth_user_id",
    InvalidArgTargetUserId: "invalid_arg_target_user_id",
    AuthUserNotFound: "auth_user_not_found",
    TargetUserNotFound: "target_user_not_found",
    CannotMuteSelf: "cannot_mute_self",
    AlreadyMuted: "already_muted",
}

type Argument = {
    auth_user_id: UserMutesSchema["user_id"]
    target_user_id: UserMutesSchema["target_user_id"]
}

export const create = async ({
    auth_user_id,
    target_user_id,
}: Argument): Promise<UserMutesSchema> => {
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
        throw new ModelRuntimeError(ErrorCodes.CannotMuteSelf)
    }

    const already_muted = (await get_mutes(
        {
            auth_user_id,
            target_user_id,
        },
        { disable_in_memory_cache: true }
    )) as UserMutesSchema

    if (already_muted) {
        throw new ModelRuntimeError(ErrorCodes.AlreadyMuted)
    }
    const mute = await UserMutes.create({
        user_id: auth_user_id,
        target_user_id: target_user_id,
    })

    return mute
}
