import { StatusSchema } from "../../schema/status"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { get } from "./get"

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
    const status = await get({ status_id })
    if (status == null) {
        throw new ModelRuntimeError(ErrorCodes.StatusNotFound)
    }
    await status.remove()
}
