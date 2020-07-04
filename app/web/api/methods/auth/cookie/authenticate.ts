import { ContentTypes } from "../../../facts/content_type"
import { HttpMethods } from "../../../facts/http_method"
import { MethodIdentifiers } from "../../../identifier"
import {
    MethodFacts,
    define_method,
    define_arguments,
    define_expected_errors,
} from "../../../define"
import * as vs from "../../../../../validation"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../../error"
import { get as get_user } from "../../../../../model/user/get"
import { get as get_login_session } from "../../../../../model/user/login_session/get"
import { ModelRuntimeError } from "../../../../../model/error"
import { UserSchema } from "app/schema/user"
import { UserLoginSessionSchema } from "app/schema/user_login_session"

export const argument_specs = define_arguments(
    ["user_id", "session_id", "session_token"] as const,
    {
        user_id: {
            description: ["ユーザーID"],
            examples: null,
            required: true,
            schema: vs.object_id(),
        },
        session_id: {
            description: ["セッションID"],
            examples: null,
            required: true,
            schema: vs.object_id(),
        },
        session_token: {
            description: ["セッショントークン"],
            examples: null,
            required: true,
            schema: vs.string(),
        },
    }
)

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_user_id",
        "invalid_arg_session_id",
        "invalid_arg_session_token",
        "session_has_expired",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_user_id: {
            description: ["ユーザーIDが不正です"],
            code: "invalid_arg_user_id",
        },
        invalid_arg_session_id: {
            description: ["セッションIDが不正です"],
            code: "invalid_arg_session_id",
        },
        invalid_arg_session_token: {
            description: ["セッショントークンが不正です"],
            code: "invalid_arg_session_token",
        },
        session_has_expired: {
            description: ["セッションの期限が切れました"],
            code: "session_has_expired",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.AuthenticateUserWithCookie,
    http_method: HttpMethods.POST,
    rate_limiting: {},
    accepted_content_types: [ContentTypes.ApplicationJson],
    authentication_required: false,
    accepted_authentication_methods: [],
    accepted_scopes: {},
    description: ["Webブラウザでログインしているユーザーの情報を取得します"],
}

export default define_method(
    facts,
    argument_specs,
    expected_error_specs,
    async (
        args,
        errors
    ): Promise<[UserSchema | null, UserLoginSessionSchema | null]> => {
        try {
            const session = await get_login_session({
                session_id: args.session_id,
            })
            if (session == null) {
                return [null, null]
            }
            if (session.expired() === true) {
                return [null, null]
            }
            if (session.user_id.equals(args.user_id) !== true) {
                return [null, null]
            }
            if (session.session_token !== args.session_token) {
                return [null, null]
            }
            const user = await get_user({ user_id: session.user_id })
            return [user, session]
        } catch (error) {
            if (error instanceof ModelRuntimeError) {
                raise(errors.internal_error, error)
            } else {
                raise(errors.unexpected_error, error)
            }
        }
        return [null, null]
    }
)
