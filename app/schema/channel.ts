import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface ChannelSchema extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    description: string | null
    stats: {
        statuses_count?: number
    }
    created_at: Date
    creator_id: mongoose.Types.ObjectId
    is_public: boolean // グローバルタイムラインやコミュニティタイムラインに投稿が表示されるかどうか
    community_id: mongoose.Types.ObjectId | null
    _schema_version?: number

    // methods
    transform: () => any
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

schema.methods.transform = function (this: ChannelSchema): any {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        stats: this.stats,
        created_at: this.created_at,
        is_public: this.is_public,
    }
}

export const Channel = mongoose.model<ChannelSchema>("channel", schema)
