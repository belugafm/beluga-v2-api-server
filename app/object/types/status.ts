import { StatusSchema, Status } from "../../schema/status"
import { StatusObject, UserObject } from "../schema"
import { ObjectTransformationError } from "../error"
import * as mongo from "../../lib/mongoose"
import { User, UserSchema } from "../../schema/user"
import { transform as transform_user } from "./user"
import { transform as transform_channel } from "./channel"
import { Channel } from "../../schema/channel"
import { StatusLikes, StatusLikesSchema } from "../../schema/status_likes"
import {
    StatusFavorites,
    StatusFavoritesSchema,
} from "../../schema/status_favorites"
import { get as get_favorites } from "../../model/status/favorites/get"
import { get as get_likes } from "../../model/status/likes/get"
import { get as get_user } from "../../model/user/get"

function remove_null(array: (UserObject | null)[]): UserObject[] {
    return array.filter((user) => user != null) as UserObject[]
}

async function is_favorited(
    status: StatusSchema,
    auth_user: UserSchema | null
) {
    if (auth_user == null) {
        return false
    }
    const favorite = await get_favorites({
        status_id: status._id,
        user_id: auth_user._id,
    })
    if (favorite == null) {
        return false
    }
    return true
}

async function likes_users(status: StatusSchema) {
    const all_likes = (await get_likes({
        status_id: status._id,
    })) as StatusLikesSchema[]
    return remove_null(
        await Promise.all(
            all_likes.map(async (likes) => {
                return await transform_user(
                    await get_user({ user_id: likes.user_id })
                )
            })
        )
    )
}

async function favorites_users(status: StatusSchema) {
    const all_favorites = (await get_favorites({
        status_id: status._id,
    })) as StatusFavoritesSchema[]
    return remove_null(
        await Promise.all(
            all_favorites.map(async (likes) => {
                return await transform_user(
                    await get_user({ user_id: likes.user_id })
                )
            })
        )
    )
}

export const transform = async (
    model: StatusSchema | null,
    auth_user: UserSchema | null
): Promise<StatusObject | null> => {
    if (model === null) {
        return null
    }
    if (model instanceof Status !== true) {
        throw new ObjectTransformationError()
    }
    return {
        id: model._id.toHexString(),
        text: model.text,
        user_id: model.user_id.toHexString(),
        user: await transform_user(
            await mongo.findOne(User, { _id: model.user_id })
        ),
        channel_id: model.channel_id.toHexString(),
        channel: await transform_channel(
            await mongo.findOne(Channel, { _id: model.channel_id })
        ),
        community_id: model.community_id
            ? model.community_id.toHexString()
            : null,
        community: null,
        created_at: model.created_at.getTime(),
        is_public: model.is_public,
        is_deleted: model.is_deleted,
        is_edited: model.is_edited,
        is_muted: false,
        is_favorited: await is_favorited(model, auth_user),
        likes: {
            count: model.like_count,
            users: await likes_users(model),
        },
        favorites: {
            count: model.favorite_count,
            users: await favorites_users(model),
        },
    }
}
