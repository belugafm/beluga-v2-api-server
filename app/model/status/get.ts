import { StatusSchema, Status } from "../../schema/status"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"

export const ErrorCodes = {
    InvalidArgStatusId: "invalid_arg_status_id",
} as const

type Argument = {
    status_id: StatusSchema["_id"]
}

export const get = async ({
    status_id,
}: Argument): Promise<StatusSchema | null> => {
    if (vs.object_id().ok(status_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgStatusId)
    }
    return await mongo.findOne(Status, { _id: status_id })
}
