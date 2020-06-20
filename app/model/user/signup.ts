import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    NameTaken: "name_taken",
}

export async function signup(
    name: UserSchema["name"],
    password: string
): Promise<UserSchema> {
    if (vs.user_name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidName)
    }
    if (vs.password().ok(password) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
    }
    const existing_user = await mongo.findOne(User, { name: name }, false)
    if (existing_user) {
        throw new ModelRuntimeError(ErrorCodes.NameTaken)
    }
    const user = await User.create({
        name: name,
        avatar_url: "",
        profile: {},
        stats: {},
        created_at: Date.now(),
    })
    return user
}
