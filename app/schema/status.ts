import mongoose, { Schema, Document } from "mongoose"
import { transform } from "../object/types/status"
import { StatusObject } from "../object/schema"

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

    transform: () => Promise<StatusObject | null>
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

schema.index({ created_at: -1 })
schema.index({ channel_id: -1, created_at: -1 })
schema.index({ community_id: -1, created_at: -1 })

schema.methods.transform = async function (
    this: StatusSchema
): Promise<StatusObject | null> {
    return await transform(this)
}

schema.post("remove", (doc, next) => {
    next()
})
schema.post("udpate", (doc, next) => {
    next()
})

export const Status = mongoose.model<StatusSchema>("status", schema)
