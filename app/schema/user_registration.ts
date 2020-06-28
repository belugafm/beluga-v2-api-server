import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface UserRegistrationSchema extends Document {
    user_id: Schema.Types.ObjectId
    fraud_score_id?: Schema.Types.ObjectId
    ip_address: string
    fingerprint?: string
    _schema_version?: number
}

export const UserRegistration = mongoose.model<UserRegistrationSchema>(
    "user_registration",
    new Schema({
        user_id: Schema.Types.ObjectId,
        fraud_score_id: Schema.Types.ObjectId,
        ip_address: String,
        fingerprint: {
            type: String,
            required: false,
        },
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    })
)
