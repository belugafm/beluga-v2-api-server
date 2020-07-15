import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface StatusFavoritesSchema extends Document {
    _id: mongoose.Types.ObjectId
    status_id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    channel_id: mongoose.Types.ObjectId
    community_id: mongoose.Types.ObjectId | null
    _schema_version?: number
}

const schema = new Schema({
    text: String,
    status_id: mongoose.Types.ObjectId,
    user_id: mongoose.Types.ObjectId,
    channel_id: mongoose.Types.ObjectId,
    community_id: mongoose.Types.ObjectId,
    _schema_version: {
        type: Number,
        default: schema_version,
    },
})

schema.index({ status_id: -1 })
schema.index({ user_id: -1, channel_id: -1 })
schema.index({ status_id: -1, user_id: -1 }, { unique: true })

export const StatusFavorites = mongoose.model<StatusFavoritesSchema>(
    "status_favorites",
    schema
)
