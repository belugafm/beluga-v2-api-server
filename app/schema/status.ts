import mongoose, { Schema, Document } from "mongoose"
import { transform } from "../object/types/status"
import { StatusObject, UserObject } from "../object/schema"
import { UserSchema } from "./user"

const schema_version = 1

export interface StatusSchema extends Document {
    _id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    channel_id: mongoose.Types.ObjectId
    community_id: mongoose.Types.ObjectId | null
    text: string
    created_at: Date
    like_count: number
    favorite_count: number
    public: boolean // グローバルタイムラインやコミュニティタイムラインに投稿が表示されるかどうか
    edited: boolean
    _schema_version?: number

    _cached?: boolean
    transform: (auth_user: UserSchema | null) => Promise<StatusObject | null>
}

const schema = new Schema({
    text: String,
    created_at: Date,
    user_id: mongoose.Types.ObjectId,
    channel_id: mongoose.Types.ObjectId,
    community_id: mongoose.Types.ObjectId,
    is_public: {
        type: Boolean,
        default: true,
    },
    like_count: {
        type: Number,
        default: 0,
    },
    favorite_count: {
        type: Number,
        default: 0,
    },
    is_edited: {
        type: Boolean,
        default: false,
    },
    _schema_version: {
        type: Number,
        default: schema_version,
    },
})

schema.index({ created_at: -1 })
schema.index({ channel_id: -1, created_at: -1 })
schema.index({ community_id: -1, created_at: -1 })

schema.methods.transform = async function (
    this: StatusSchema,
    auth_user: UserSchema | null
): Promise<StatusObject | null> {
    return await transform(this, auth_user)
}

export const Status = mongoose.model<StatusSchema>("status", schema)
