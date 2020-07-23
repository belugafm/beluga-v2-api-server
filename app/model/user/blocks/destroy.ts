import * as vs from "../../../validation"
import { ModelRuntimeError } from "../../error"
import { get as get_blocks } from "./get"
import { get as get_user } from "../get"
import { UserBlocksSchema } from "../../../schema/user_blocks"

export const ErrorCodes = {
    InvalidArgAuthUserId: "invalid_arg_auth_user_id",
    InvalidArgTargetUserId: "invalid_arg_target_user_id",
    AuthUserNotFound: "auth_user_not_found",
    TargetUserNotFound: "target_user_not_found",
    CannotUnblockSelf: "cannot_unblock_self",
    AlreadyUnblocked: "already_unblocked",
}

type Argument = {
    auth_user_id: UserBlocksSchema["user_id"]
    target_user_id: UserBlocksSchema["target_user_id"]
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
        throw new ModelRuntimeError(ErrorCodes.CannotUnblockSelf)
    }

    const block = (await get_blocks(
        {
            auth_user_id,
            target_user_id,
        },
        { disable_cache: true }
    )) as UserBlocksSchema

    if (block == null) {
        throw new ModelRuntimeError(ErrorCodes.AlreadyUnblocked)
    }
    await block.remove()
}
