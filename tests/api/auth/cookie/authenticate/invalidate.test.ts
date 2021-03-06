import { env } from "../../../../mongodb"
import signup from "../../../../../app/web/api/methods/account/signup"
import signin from "../../../../../app/web/api/methods/account/signin"
import { User, UserSchema } from "../../../../../app/schema/user"
import {
    UserLoginSession,
    UserLoginSessionSchema,
} from "../../../../../app/schema/user_login_session"
import authenticate_login_session from "../../../../../app/web/api/methods/auth/cookie/authenticate"
import { invalidate_last_login_session } from "../../../../../app/web/auth"
import { document_cache } from "../../../../../app/document/cache"

document_cache.disable()

describe("auth/cookie/authenticate", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("invalidate", async () => {
        const user = (await signup({
            name: "beluga",
            password: "password",
            confirmed_password: "password",
            ip_address: "127.0.0.1",
            fingerprint:
                "0000000000000000000000000000000000000000000000000000000000000000",
        })) as UserSchema
        expect(user).toBeInstanceOf(User)
        const [logged_in_user, session] = (await signin({
            name: "beluga",
            password: "password",
            ip_address: "127.0.0.1",
            session_lifetime: 60 * 1000,
        })) as [UserSchema, UserLoginSessionSchema]
        expect(logged_in_user).toBeInstanceOf(User)
        expect(session).toBeInstanceOf(UserLoginSession)

        {
            const [_user, _session] = (await authenticate_login_session({
                user_id: logged_in_user._id,
                session_id: session._id,
                session_token: session.session_token,
            })) as [UserSchema, UserLoginSessionSchema]
            expect(_user).toBeInstanceOf(User)
            expect(_session).toBeInstanceOf(UserLoginSession)
        }
        await invalidate_last_login_session({
            user_id: logged_in_user._id,
            session_id: session._id,
            session_token: session.session_token,
        })
        {
            const [_user, _session] = (await authenticate_login_session({
                user_id: logged_in_user._id,
                session_id: session._id,
                session_token: session.session_token,
            })) as [UserSchema, UserLoginSessionSchema]
            expect(_user).toBeNull()
            expect(_session).toBeNull()
        }
    })
})
