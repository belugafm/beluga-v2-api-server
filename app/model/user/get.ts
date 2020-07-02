import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import mongoose, { ClientSession } from "mongoose"
import { _unsafe_reclassify_as_dormant } from "./reclassify_as_dormant"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidUserId: "invalid_user_id",
}

type Argument = {
    name?: UserSchema["name"]
    user_id?: mongoose.Types.ObjectId
    session?: ClientSession
}

export const get = async ({
    name,
    user_id,
    session,
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
    if (session) {
        return await mongo.findOne(User, condition, (query) => {
            // case insensitiveにする
            query
                .collation({
                    locale: "en_US",
                    strength: 2,
                })
                .session(session)
        })
    } else {
        return await mongo.findOne(User, condition, (query) => {
            // case insensitiveにする
            query.collation({
                locale: "en_US",
                strength: 2,
            })
        })
    }
}
