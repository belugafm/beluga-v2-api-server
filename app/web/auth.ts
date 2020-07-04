import { MethodFacts } from "./api/define"
import { UserSchema } from "../schema/user"
import mongoose from "mongoose"
import authenticate_login_session from "./api/methods/auth/cookie/authenticate"
import { invalidate } from "../model/user/login_session/invalidate"

export const invalidate_last_login_session = async (cookies: any) => {
    const [user, session] = await authenticate_user_with_cookie(cookies)
    if (session) {
        await invalidate({ session_id: session._id })
    }
}

export const authenticate_user_with_cookie = async (cookies: any) => {
    cookies = cookies || {}
    const user_id_str = cookies["user_id"]
    const session_id_str = cookies["session_id"]
    const session_token = cookies["session_token"]
    if (user_id_str && session_id_str && session_token) {
        return await authenticate_login_session({
            user_id: mongoose.Types.ObjectId(user_id_str),
            session_id: mongoose.Types.ObjectId(session_id_str),
            session_token: session_token,
        })
    }
    return [null, null]
}

export const authenticate_user = async (
    facts: MethodFacts,
    query: any,
    cookies: any
): Promise<UserSchema | null> => {
    query = query || {}
    cookies = cookies || {}
    const {
        access_token,
        access_token_scret,
        oauth_consumer_key,
        oauth_consumer_secret,
        oauth_bearer_token,
    } = query

    if (facts.accepted_authentication_methods.includes("OAuth")) {
        if (oauth_bearer_token && oauth_consumer_key && oauth_consumer_secret) {
            // OAuth認証
        }
    }
    if (facts.accepted_authentication_methods.includes("AccessToken")) {
        if (access_token && access_token_scret) {
            // アクセストークンによる認証
        }
    }
    if (facts.accepted_authentication_methods.includes("Cookie")) {
        // Cookieを使ったログインセッション
        const [user, session] = await authenticate_user_with_cookie(cookies)
        return user
    }
    return null
}
