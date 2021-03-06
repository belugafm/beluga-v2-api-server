import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface UserRegistrationSchema extends Document {
    user_id: mongoose.Types.ObjectId
    fraud_score_id?: mongoose.Types.ObjectId
    ip_address: string
    fingerprint?: string
    date: Date
    _schema_version?: number
}

export const UserRegistration = mongoose.model<UserRegistrationSchema>(
    "user_registration",
    new Schema({
        user_id: {
            type: mongoose.Types.ObjectId,
            unique: true,
        },
        fraud_score_id: mongoose.Types.ObjectId,
        ip_address: String,
        date: Date,
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
