import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface UserLoginSessionSchema extends Document {
    _id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    fraud_score_id?: mongoose.Types.ObjectId
    session_token: string
    ip_address: string
    created_at: Date
    expire_date: Date
    expired: boolean
    _schema_version?: number

    ok: () => boolean
}

const schema = new Schema({
    user_id: mongoose.Types.ObjectId,
    fraud_score_id: {
        type: mongoose.Types.ObjectId,
        required: false,
    },
    session_token: String,
    ip_address: String,
    created_at: Date,
    expire_date: Date,
    expired: {
        type: Boolean,
        default: false,
    },
    _schema_version: {
        type: Number,
        default: schema_version,
    },
})

schema.index({ user_id: 1, session_token: 1 }, { unique: true })

schema.methods.ok = function (this: UserLoginSessionSchema): boolean {
    if (this.expired === true) {
        return false
    }
    const current = new Date()
    if (current.getTime() > this.expire_date.getTime()) {
        return false
    }
    return true
}

export const UserLoginSession = mongoose.model<UserLoginSessionSchema>(
    "user_login_session",
    schema
)
