import mongoose, { Schema, Document } from "mongoose"
import { transform, TransformOption } from "../object/types/status"
import { StatusObject } from "../object/schema"
import { UserSchema } from "./user"

const schema_version = 1

export type ChannelEntity = {
    channel_id: mongoose.Types.ObjectId
    indices: [number, number]
}

export type StatusEntity = {
    status_id: mongoose.Types.ObjectId
    indices: [number, number]
}

export type Entities = {
    channels: ChannelEntity[]
    statuses: StatusEntity[]
}

export interface StatusSchema extends Document {
    _id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    channel_id: mongoose.Types.ObjectId
    community_id: mongoose.Types.ObjectId | null
    text: string
    created_at: Date
    like_count: number
    favorite_count: number
    comment_count: number
    thread_status_id: mongoose.Types.ObjectId | null
    public: boolean // グローバルタイムラインやコミュニティタイムラインに投稿が表示されるかどうか
    edited: boolean
    entities: Entities
    _schema_version?: number

    _cached?: boolean
    transform: (
        auth_user: UserSchema | null,
        options?: TransformOption
    ) => Promise<StatusObject | null>
}

const schema = new Schema(
    {
        text: String,
        created_at: Date,
        user_id: mongoose.Types.ObjectId,
        channel_id: mongoose.Types.ObjectId,
        community_id: mongoose.Types.ObjectId,
        thread_status_id: mongoose.Types.ObjectId,
        entities: {
            type: Object,
            default: {},
        },
        public: {
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
        comment_count: {
            type: Number,
            default: 0,
        },
        edited: {
            type: Boolean,
            default: false,
        },
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    },
    {
        collection: "status",
    }
)

schema.index({ created_at: -1 })
schema.index({ channel_id: -1, created_at: -1 })
schema.index({ community_id: -1, created_at: -1 })
schema.index({ thread_status_id: -1, created_at: -1 })

schema.methods.transform = async function (
    this: StatusSchema,
    auth_user: UserSchema | null,
    options: TransformOption
): Promise<StatusObject | null> {
    return await transform(this, auth_user, options)
}

export const Status = mongoose.model<StatusSchema>("status", schema)
