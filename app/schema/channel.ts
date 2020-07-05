import mongoose, { Schema, Document } from "mongoose"
import { transform } from "../object/types/channel"
import { ChannelObject } from "../object/schema"

const schema_version = 1

export interface ChannelSchema extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    description: string | null
    stats: {
        statuses_count: number
    }
    created_at: Date
    creator_id: mongoose.Types.ObjectId
    is_public: boolean // グローバルタイムラインやコミュニティタイムラインに投稿が表示されるかどうか
    community_id: mongoose.Types.ObjectId | null
    _schema_version?: number

    // methods
    transform: () => Promise<ChannelObject | null>
}

const schema = new Schema({
    name: String,
    description: {
        type: String,
        default: null,
    },
    creator_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    stats: {
        statuses_count: {
            type: Number,
            default: 0,
        },
    },
    created_at: Date,
    is_public: {
        type: Boolean,
        default: false,
    },
    community_id: {
        type: mongoose.Types.ObjectId,
        default: null,
    },
    _schema_version: {
        type: Number,
        default: schema_version,
    },
})

schema.methods.transform = async function (
    this: ChannelSchema
): Promise<ChannelObject | null> {
    return await transform(this)
}

export const Channel = mongoose.model<ChannelSchema>("channel", schema)
