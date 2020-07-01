import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import mongoose from "mongoose"
import { _unsafe_reclassify_as_dormant } from "./reclassify_as_dormant"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidUserId: "invalid_user_id",
}

type Argument = {
    name?: UserSchema["name"]
    user_id?: mongoose.Types.ObjectId
}

export const get = async ({
    name,
    user_id,
}: Argument): Promise<UserSchema | null> => {
    const condition: any = {}
    if (name) {
        if (vs.user_name().ok(name) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidName)
        }
        condition["name"] = name
    }
    if (user_id) {
        if (vs.object_id().ok(user_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
        }
        condition["_id"] = user_id
    }
    return await mongo.findOne(User, condition, (query) => {
        // case insensitiveにする
        query.collation({
            locale: "en_US",
            strength: 2,
        })
    })
}
