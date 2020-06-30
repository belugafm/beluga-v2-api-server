import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import {
    MethodFacts,
    define_method,
    define_arguments,
    define_expected_errors,
    ExpectedError,
} from "../../define"
import * as vs from "../../../../validation"
import {
    InternalErrorSpec,
    UnexpectedErrorSpec,
    WebApiRuntimeError,
} from "../../error"
import { signin } from "../../../../model/user/signin"
import { ModelRuntimeError } from "../../../../model/error"
import { UserSchema } from "app/schema/user"
import { UserLoginSessionSchema } from "app/schema/user_login_session"

export const argument_specs = define_arguments(
    ["name", "password", "ip_address"] as const,
    {
        name: {
            description: ["ユーザー名"],
            examples: ["beluga"],
            required: true,
            schema: vs.user_name(),
        },
        password: {
            description: ["パスワード"],
            examples: null,
            required: true,
            schema: vs.password(),
        },
        ip_address: {
            description: ["登録時のIPアドレス"],
            examples: null,
            required: true,
            schema: vs.ip_address(),
        },
    }
)

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_name",
        "invalid_arg_password",
        "invalid_arg_ip_address",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_name: {
            description: ["ユーザー名が基準を満たしていません"],
            argument: "name",
            code: "invalid_arg_name",
        },
        invalid_arg_password: {
            description: ["パスワードが基準を満たしていません"],
            argument: "password",
            code: "invalid_arg_password",
        },
        invalid_arg_ip_address: {
            description: ["登録ユーザーのIPアドレスを正しく指定してください"],
            hint: [],
            argument: "ip_address",
            code: "invalid_arg_ip_address",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.Login,
    http_method: HttpMethods.POST,
    rate_limiting: {},
    accepted_content_types: [ContentTypes.ApplicationJson],
    authentication_required: false,
    accepted_authentication_methods: [],
    accepted_scopes: [],
    description: ["アカウントにログインします"],
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
            return await signin({
                name: args.name,
                password: args.password,
                ip_address: args.ip_address,
            })
        } catch (error) {
            if (error instanceof ModelRuntimeError) {
                if (error.code === "invalid_name") {
                    raise(errors.invalid_arg_name, error)
                } else if (error.code === "invalid_password") {
                    raise(errors.invalid_arg_password, error)
                } else {
                    raise(errors.internal_error, error)
                }
            } else {
                raise(errors.unexpected_error, error)
            }
        }
    }
)
