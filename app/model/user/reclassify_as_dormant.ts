import { User, DormantUser, UserSchema } from "../../schema/user"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import mongoose from "mongoose"

export const ErrorCodes = {
    InvalidArgument: "invalid_arg_argument",
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidUser: "invalid_arg_user",
    UserNotFound: "user_not_found",
    UnexpectedError: "unexpected_error",
}

type Argument = {
    user_id?: mongoose.Types.ObjectId
    user?: UserSchema | null
}

export const _unsafe_reclassify_as_dormant = async (user: UserSchema) => {
    await DormantUser.create({
        _id: user._id,
        name: user.name,
        display_name: user.display_name,
        profile: user.profile,
        stats: user.stats,
        created_at: user.created_at,
        is_active: user.is_active,
        is_dormant: true,
        last_activity_date: user.last_activity_date,
    })
    user.remove()
}

export const reclassify_as_dormant = async ({
    user_id,
    user,
}: Argument): Promise<void> => {
    if (user_id) {
        if (user_id instanceof mongoose.Types.ObjectId === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
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
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await _unsafe_reclassify_as_dormant(user)
        session.commitTransaction()
        session.endSession()
    } catch (error) {
        session.abortTransaction()
        session.endSession()
        throw error
    }
}
