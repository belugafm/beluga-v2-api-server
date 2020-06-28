import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import bcrypt from "bcrypt"
import config from "../../config/app"
import mongoose from "mongoose"
import { add as add_login_credential } from "./login_credential/add"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    NameTaken: "name_taken",
}

export const signup = async (
    name: UserSchema["name"],
    password: string
): Promise<UserSchema> => {
    if (vs.user_name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidName)
    }
    if (vs.password().ok(password) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
    }
    const existing_user = await mongo.findOne(User, { name: name }, (query) => {
        query.collation({
            locale: "en_US",
            strength: 2,
        })
    })
    if (existing_user) {
        throw new ModelRuntimeError(ErrorCodes.NameTaken)
    }
    const password_hash = await bcrypt.hash(
        password,
        config.password.salt_rounds
    )

    const session = await mongoose.startSession()
    session.startTransaction()

    const user = await User.create({
        name: name,
        avatar_url: "",
        profile: {},
        stats: {},
        created_at: Date.now(),
    })
    const credential = await add_login_credential(user._id, password_hash)

    session.commitTransaction()
    session.endSession()
    return user
}
