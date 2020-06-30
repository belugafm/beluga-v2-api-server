import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface UserLoginCredentialSchema extends Document {
    user_id: Schema.Types.ObjectId
    password_hash: string
    _schema_version?: number
}

export const UserLoginCredential = mongoose.model<UserLoginCredentialSchema>(
    "user_login_credential",
    new Schema({
        user_id: {
            type: Schema.Types.ObjectId,
            unique: true,
        },
        password_hash: String,
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    })
)
