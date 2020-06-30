import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface UserLoginSessionSchema extends Document {
    user_id: Schema.Types.ObjectId
    fraud_score_id?: Schema.Types.ObjectId
    session_id: string
    ip_address: string
    created_at: Date
    expire_date: Date
    _schema_version?: number
}

export const UserLoginSession = mongoose.model<UserLoginSessionSchema>(
    "user_login_session",
    new Schema({
        user_id: Schema.Types.ObjectId,
        fraud_score_id: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        session_id: String,
        ip_address: String,
        created_at: Date,
        expire_date: Date,
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    })
)
