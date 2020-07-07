import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import mongoose, { ClientSession } from "mongoose"
import { _unsafe_reclassify_as_dormant } from "./reclassify_as_dormant"

export const ErrorCodes = {
    InvalidArgName: "invalid_arg_name",
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidArgs: "invalid_arguments",
}

type Argument = {
    name?: UserSchema["name"]
    user_id?: mongoose.Types.ObjectId
    transaction_session?: ClientSession
}

export const get = async ({
    name,
    user_id,
    transaction_session,
}: Argument): Promise<UserSchema | null> => {
    if (name) {
        if (vs.user.name().ok(name) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgName)
        }
        return await mongo.findOne(
            User,
            { name },
            {
                transaction_session: transaction_session,

                // nameの場合in-memory cacheの自動消去が機能しないのでmongodbから直接結果を返す
                disable_in_memory_cache: true,

                // case-insensitive
                additional_query_func: (query) => {
                    query.collation({
                        locale: "en_US",
                        strength: 2,
                    })
                },
            }
        )
    } else if (user_id) {
        if (vs.object_id().ok(user_id) !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
        }
        return await mongo.findOne(
            User,
            { _id: user_id },
            {
                transaction_session: transaction_session,
                disable_in_memory_cache: transaction_session ? true : false,
            }
        )
    } else {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgs)
    }
}
