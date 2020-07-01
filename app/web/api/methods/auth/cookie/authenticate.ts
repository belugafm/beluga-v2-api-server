import { ContentTypes } from "../../../facts/content_type"
import { HttpMethods } from "../../../facts/http_method"
import { MethodIdentifiers } from "../../../identifier"
import {
    MethodFacts,
    define_method,
    define_arguments,
    define_expected_errors,
    ExpectedError,
} from "../../../define"
import * as vs from "../../../../../validation"
import {
    InternalErrorSpec,
    UnexpectedErrorSpec,
    WebApiRuntimeError,
} from "../../../error"
import { get as get_user } from "../../../../../model/user/get"
import { get as get_login_session } from "../../../../../model/user/login_session/get"
import { ModelRuntimeError } from "../../../../../model/error"

export const argument_specs = define_arguments(
    ["session_id", "user_id"] as const,
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
            schema: vs.string(),
        },
    }
)

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_user_id",
        "invalid_arg_session_id",
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

function raise<T extends string, S>(
    spec: ExpectedError<T, S>,
    source_error?: Error
) {
    if (source_error) {
        throw new WebApiRuntimeError(spec, source_error.message)
    } else {
        throw new WebApiRuntimeError(spec)
    }
}

export default define_method(
    facts,
    argument_specs,
    expected_error_specs,
    async (args, errors) => {
        try {
            const session = await get_login_session({
                user_id: args.user_id,
                session_id: args.session_id,
            })
            if (session == null) {
                return null
            }
            if (session.invalidated === true) {
                return null
            }
            if (session.expired() === true) {
                return null
            }
            return await get_user({ user_id: session.user_id })
        } catch (error) {
            if (error instanceof ModelRuntimeError) {
                raise(errors.internal_error, error)
            } else {
                raise(errors.unexpected_error, error)
            }
        }
    }
)
