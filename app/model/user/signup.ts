import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { findOne } from "../../lib/mongoose"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    NameTaken: "name_taken",
    MongoDBError: "mongodb_error",
}

export async function signup(name: UserSchema["name"], password: string) {
    if (vs.user_name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidName)
    }
    if (vs.password().ok(password) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
    }
    const existing_user = await findOne(User, { name: name })
    if (existing_user) {
        throw new ModelRuntimeError(ErrorCodes.NameTaken)
    }
    try {
        const user = await User.create({
            name: name,
            avatar_url: "",
            profile: {},
            stats: {},
            created_at: Date.now(),
        })
    } catch (error) {
        console.log(error)
    }
    console.log("done")
}
