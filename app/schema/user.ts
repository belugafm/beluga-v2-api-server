import mongoose, { Schema, Document } from "mongoose"

const schema_version = 1

export interface UserSchema extends Document {
    name: string
    display_name?: string
    avatar_url: string
    profile: {
        location?: string
        description?: string
        theme_color?: string
        background_image_url?: string
    }
    stats: {
        statuses_count?: number
    }
    created_at: Date
    _schema_version?: number
}

const UndefinedString = {
    type: String,
    default: undefined,
}

export const User = mongoose.model<UserSchema>(
    "user",
    new Schema({
        name: {
            type: String,
            unique: true,
        },
        avatar_url: String,
        display_name: UndefinedString,
        profile: {
            location: UndefinedString,
            description: UndefinedString,
            theme_color: UndefinedString,
            background_image_url: UndefinedString,
        },
        stats: {
            statuses_count: {
                type: Number,
                default: 0,
            },
        },
        created_at: Date,
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    })
)
