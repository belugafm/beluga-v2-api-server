import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import bcrypt from "bcrypt"
import config from "../../config/app"
import mongoose from "mongoose"
import { add as add_login_credential } from "./login_credential/add"
import { add as add_registration_info } from "./registration/add"
import { get as get_fraud_score } from "./../fraud_score/get"
import { add as add_fraud_score } from "./../fraud_score/add"
import { FraudScoreSchema } from "app/schema/fraud_score"
import * as ipqs from "../../lib/ipqs"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    InvalidIpAddress: "invalid_ip_address",
    InvalidFingerprint: "invalid_fingerprint",
    NameTaken: "name_taken",
}

const generate_fraud_score_if_needed = async (
    ip_address: string
): Promise<FraudScoreSchema | null> => {
    if (config.fraud_prevention.enabled === false) {
        return null
    }
    const existing_fraud_score = await get_fraud_score(ip_address)
    if (existing_fraud_score) {
        return existing_fraud_score
    }
    const result = await ipqs.get_score(ip_address)
    if (result.success === false) {
        return null
    }
    return add_fraud_score(ip_address, result)
}

export const signup = async ({
    name,
    password,
    ip_address,
    fingerprint,
}: {
    name: UserSchema["name"]
    password: string
    ip_address: string
    fingerprint?: string
}): Promise<UserSchema> => {
    if (vs.user_name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidName)
    }
    if (vs.password().ok(password) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
    }
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    if (fingerprint) {
        if (
            vs.string({ min_length: 64, max_length: 64 }).ok(fingerprint) !==
            true
        ) {
            throw new ModelRuntimeError(ErrorCodes.InvalidFingerprint)
        }
    }
    const existing_user = await mongo.findOne(User, { name: name }, (query) => {
        // case insensitiveにする
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

    const fraud_score = await generate_fraud_score_if_needed(ip_address)
    const fraud_score_id = fraud_score ? fraud_score._id : null
    const registration_info = await add_registration_info(
        user._id,
        ip_address,
        fraud_score_id,
        fingerprint
    )

    session.commitTransaction()
    session.endSession()
    return user
}
