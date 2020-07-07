import mongoose, { Schema, Document } from "mongoose"
import { in_memory_cache } from "../lib/cache"

const schema_version = 1

export interface UserLoginCredentialSchema extends Document {
    user_id: mongoose.Types.ObjectId
    password_hash: string
    _schema_version?: number
}

export const UserLoginCredential = mongoose.model<UserLoginCredentialSchema>(
    "user_login_credential",
    new Schema({
        user_id: {
            type: mongoose.Types.ObjectId,
            unique: true,
        },
        password_hash: String,
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    })
)

UserLoginCredential.watch().on("change", (event) => {
    in_memory_cache.handleChangeEvent(UserLoginCredential.modelName, event)
})
