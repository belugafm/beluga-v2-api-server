import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface StatusSchema extends Document {
    _id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    channel_id: mongoose.Types.ObjectId
    community_id: mongoose.Types.ObjectId | null
    text: string
    created_at: Date
    is_public: boolean // グローバルタイムラインやコミュニティタイムラインに投稿が表示されるかどうか
    is_edited: boolean
    is_deleted: boolean
    _schema_version?: number
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
    is_edited: {
        type: Boolean,
        default: false,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    _schema_version: {
        type: Number,
        default: schema_version,
    },
})

export const Status = mongoose.model<StatusSchema>("status", schema)
