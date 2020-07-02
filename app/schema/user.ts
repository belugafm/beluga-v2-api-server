import mongoose, { Schema, Document } from "mongoose"
import config from "../config/app"

const schema_version = 1

export interface UserSchema extends Document {
    _id: mongoose.Types.ObjectId
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
    active: boolean // 登録後サイトを利用したかどうか
    dormant: boolean // サイトを長期間利用しなかったかどうか
    last_activity_date?: Date
    _terms_of_service_agreement_date?: Date
    _terms_of_service_agreement_version?: string
    _schema_version?: number

    // methods
    needsReclassifyAsDormant: () => boolean
    transform: () => any
}

const UndefinedString = {
    type: String,
    default: undefined,
}

function define_schema(): any {
    return {
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
        active: {
            type: Boolean,
            default: false,
        },
        dormant: {
            type: Boolean,
            default: false,
        },
        last_activity_date: {
            type: Date,
            default: null,
        },
        _terms_of_service_agreement_date: {
            type: Date,
            default: null,
        },
        _terms_of_service_agreement_version: {
            type: String,
            default: null,
        },
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    }
}

const user_schema = new Schema(define_schema())

// 休眠アカウントとみなすかどうか
user_schema.methods.needsReclassifyAsDormant = function (
    this: UserSchema
): boolean {
    const current = new Date()
    if (this.active && this.last_activity_date) {
        const seconds =
            (current.getTime() - this.last_activity_date.getTime()) / 1000
        if (
            seconds >
            config.user_registration.reclassify_active_as_dormant_period
        ) {
            return true
        } else {
            return false
        }
    } else {
        const seconds = (current.getTime() - this.created_at.getTime()) / 1000
        if (
            seconds >
            config.user_registration.reclassify_inactive_as_dormant_period
        ) {
            return true
        } else {
            return false
        }
    }
}

user_schema.methods.transform = function (this: UserSchema): any {
    return {
        id: this._id,
        name: this.name,
        display_name: this.display_name,
        avatar_url: this.avatar_url,
        profile: this.profile,
        stats: this.stats,
        created_at: this.created_at,
        last_activity_date: this.last_activity_date,
    }
}

export const User = mongoose.model<UserSchema>("user", user_schema)

// dormant_userコレクションには同じ名前のユーザーが複数入る可能性がある
const dormant_user_schema_definition = define_schema()
dormant_user_schema_definition.name.unique = false
dormant_user_schema_definition._id = mongoose.Types.ObjectId

export const DormantUser = mongoose.model<UserSchema>(
    "dormant_user",
    new Schema(dormant_user_schema_definition)
)
