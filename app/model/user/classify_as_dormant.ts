import { User, DormantUser, UserSchema } from "../../schema/user"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import mongoose from "mongoose"

export const ErrorCodes = {
    InvalidArgument: "invalid_argument",
    InvalidUserId: "invalid_user_id",
    InvalidUser: "invalid_user",
    UserNotFound: "user_not_found",
    UnexpectedError: "unexpected_error",
}

type Argument = {
    user_id?: mongoose.Schema.Types.ObjectId
    user?: UserSchema | null
}

export const classify_as_dormant = async ({
    user_id,
    user,
}: Argument): Promise<void> => {
    if (user_id) {
        if (user_id instanceof mongoose.Types.ObjectId === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
        }
        user = await mongo.findOne(User, { _id: user_id })
    } else if (user) {
        if (user instanceof User !== true) {
            throw new ModelRuntimeError(ErrorCodes.InvalidUser)
        }
    } else {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgument)
    }

    if (user == null) {
        throw new ModelRuntimeError(ErrorCodes.UserNotFound)
    }
    const dormant_user = await DormantUser.create({
        _id: user._id,
        name: user.name,
        avatar_url: user.avatar_url,
        profile: user.profile,
        stats: user.stats,
        created_at: user.created_at,
        active: user.active,
        dormant: true,
        last_activity_date: user.last_activity_date,
    })
    if (dormant_user == null) {
        throw new ModelRuntimeError(ErrorCodes.UnexpectedError)
    }
}
