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
    is_expired: boolean
    _schema_version?: number

    expired: () => boolean
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
    is_expired: {
        type: Boolean,
        default: false,
    },
    _schema_version: {
        type: Number,
        default: schema_version,
    },
})

schema.index({ user_id: 1, session_token: 1 }, { unique: true })

schema.methods.expired = function (this: UserLoginSessionSchema): boolean {
    if (this.is_expired === true) {
        return true
    }
    const current = new Date()
    if (current.getTime() > this.expire_date.getTime()) {
        return true
    } else {
        return false
    }
}

export const UserLoginSession = mongoose.model<UserLoginSessionSchema>(
    "user_login_session",
    schema
)
