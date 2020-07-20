import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface UserBlocksSchema extends Document {
    _id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    target_user_id: mongoose.Types.ObjectId
    _schema_version?: number
}

const schema = new Schema({
    text: String,
    target_user_id: mongoose.Types.ObjectId,
    user_id: mongoose.Types.ObjectId,
    _schema_version: {
        type: Number,
        default: schema_version,
    },
})

schema.index({ user_id: -1 })
schema.index({ user_id: -1, target_user_id: -1 }, { unique: true })

export const UserBlocks = mongoose.model<UserBlocksSchema>(
    "user_blocks",
    schema
)
