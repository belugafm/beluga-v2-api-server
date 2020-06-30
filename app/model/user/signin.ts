import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import bcrypt from "bcrypt"
import config from "../../config/app"
import mongoose from "mongoose"
import { get as get_login_credential } from "./login_credential/get"
import { get as get_fraud_score } from "../fraud_score/get"
import { add as add_fraud_score } from "../fraud_score/add"
import { generate as generate_session } from "./login_session/generate"
import { FraudScoreSchema } from "../../schema/fraud_score"
import { UserLoginSessionSchema } from "../../schema/user_login_session"
import { _unsafe_reclassify_as_dormant } from "./reclassify_as_dormant"
import * as ipqs from "../../lib/ipqs"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    InvalidIpAddress: "invalid_ip_address",
}

const request_fraud_score_if_needed = async (
    ip_address: string
): Promise<FraudScoreSchema | null> => {
    if (config.fraud_prevention.enabled !== true) {
        return null
    }
    const existing_fraud_score = await get_fraud_score({ ip_address })
    if (existing_fraud_score) {
        return existing_fraud_score
    }
    const result = await ipqs.get_score(ip_address)
    if (result.success !== true) {
        return null
    }
    return add_fraud_score({ ip_address, result })
}

type Argument = {
    name: UserSchema["name"]
    password: string
    ip_address: string
    session_lifetime: number
}

export const signin = async ({
    name,
    password,
    ip_address,
    session_lifetime,
}: Argument): Promise<[UserSchema, UserLoginSessionSchema]> => {
    if (vs.user_name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidName)
    }
    if (vs.password().ok(password) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
    }
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }

    const sess = await mongoose.startSession()
    sess.startTransaction()
    try {
        const user = await mongo.findOne(User, { name: name })
        if (user == null) {
            throw new ModelRuntimeError(ErrorCodes.InvalidName)
        }

        const credential = await get_login_credential({
            user_id: user._id,
        })
        if (credential == null) {
            throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
        }
        if (
            (await bcrypt.compare(password, credential.password_hash)) !== true
        ) {
            throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
        }

        const fraud_score = await request_fraud_score_if_needed(ip_address)
        const fraud_score_id = fraud_score ? fraud_score._id : null

        const login_session = await generate_session({
            lifetime: session_lifetime,
            user_id: user._id,
            ip_address,
            fraud_score_id,
        })

        sess.commitTransaction()
        sess.endSession()
        return [user, login_session]
    } catch (error) {
        sess.abortTransaction()
        sess.endSession()
        throw error
    }
}
