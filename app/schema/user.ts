import mongoose, { Schema, Document } from "mongoose"
import config from "../config/app"
import { transform } from "../object/types/user"
import { UserObject } from "../object/schema"

const schema_version = 1

export interface UserSchema extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    display_name: string | null
    profile: {
        avatar_image_url: string
        location: string | null
        description: string | null
        theme_color: string | null
        background_image_url: string | null
    }
    stats: {
        statuses_count: number
    }
    created_at: Date
    is_active: boolean // 登録後サイトを利用したかどうか
    is_dormant: boolean // サイトを長期間利用しなかったかどうか
    last_activity_date: Date | null
    _terms_of_service_agreement_date?: Date
    _terms_of_service_agreement_version?: string
    _schema_version?: number

    // methods
    needsReclassifyAsDormant: () => boolean
    transform: (auth_user: UserSchema | null) => Promise<UserObject | null>
}

const NullString = {
    type: String,
    default: null,
}

function define_schema(): any {
    return {
        name: {
            type: String,
            unique: true,
        },
        display_name: NullString,
        profile: {
            avatar_image_url: String,
            location: NullString,
            description: NullString,
            theme_color: NullString,
            background_image_url: NullString,
        },
        stats: {
            statuses_count: {
                type: Number,
                default: 0,
            },
        },
        created_at: Date,
        is_active: {
            type: Boolean,
            default: false,
        },
        is_dormant: {
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
    if (this.is_active && this.last_activity_date) {
        const seconds =
            (current.getTime() - this.last_activity_date.getTime()) / 1000
        if (
            seconds >
            config.user_registration.reclassify_active_as_dormant_after
        ) {
            return true
        } else {
            return false
        }
    } else {
        const seconds = (current.getTime() - this.created_at.getTime()) / 1000
        if (
            seconds >
            config.user_registration.reclassify_inactive_as_dormant_after
        ) {
            return true
        } else {
            return false
        }
    }
}

user_schema.methods.transform = async function (
    this: UserSchema,
    auth_user: UserSchema | null
): Promise<UserObject | null> {
    return await transform(this, auth_user)
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
