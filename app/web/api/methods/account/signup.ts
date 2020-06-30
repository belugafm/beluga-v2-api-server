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
import {
    signup,
    ErrorCodes as ModelErrorCodes,
} from "../../../../model/user/signup"
import { ModelRuntimeError } from "../../../../model/error"

export const argument_specs = define_arguments(
    [
        "name",
        "password",
        "confirmed_password",
        "fingerprint",
        "ip_address",
    ] as const,
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
        confirmed_password: {
            description: ["確認用のパスワード"],
            examples: null,
            required: true,
            schema: vs.password(),
        },
        fingerprint: {
            description: ["Browser Fingerprint"],
            examples: null,
            required: false,
            schema: vs.string({
                min_length: 64,
                max_length: 64,
            }),
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
        "invalid_arg_confirmed_password",
        "invalid_arg_ip_address",
        "invalid_arg_fingerprint",
        "name_taken",
        "too_many_requests",
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
        invalid_arg_confirmed_password: {
            description: ["確認用のパスワードが一致しません"],
            hint: ["パスワードと確認用パスワードは同じものを入力してください"],
            argument: "confirmed_password",
            code: "invalid_arg_confirmed_password",
        },
        invalid_arg_ip_address: {
            description: ["登録ユーザーのIPアドレスを正しく指定してください"],
            hint: [],
            argument: "ip_address",
            code: "invalid_arg_ip_address",
        },
        invalid_arg_fingerprint: {
            description: ["不正なfingerprintです"],
            hint: [],
            argument: "fingerprint",
            code: "invalid_arg_fingerprint",
        },
        name_taken: {
            description: [
                "このユーザー名はすでに取得されているため、新規作成できません",
            ],
            hint: ["別のユーザー名でアカウントを作成してください"],
            code: "name_taken",
        },
        too_many_requests: {
            description: ["アカウントの連続作成はできません"],
            hint: ["しばらく時間をおいてから再度登録してください"],
            code: "too_many_requests",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateAccount,
    http_method: HttpMethods.POST,
    rate_limiting: {},
    accepted_content_types: [ContentTypes.ApplicationJson],
    authentication_required: false,
    accepted_authentication_methods: [],
    accepted_scopes: [],
    description: ["新規アカウントを作成します"],
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
        if (args.password !== args.confirmed_password) {
            raise(errors.invalid_arg_confirmed_password)
        }
        try {
            return await signup({
                name: args.name,
                password: args.password,
                ip_address: args.ip_address,
                fingerprint: args.fingerprint,
            })
        } catch (error) {
            if (error instanceof ModelRuntimeError) {
                if (error.code === ModelErrorCodes.NameTaken) {
                    raise(errors.name_taken, error)
                } else if (error.code === ModelErrorCodes.TooManyRequests) {
                    raise(errors.too_many_requests, error)
                } else {
                    raise(errors.internal_error, error)
                }
            } else {
                raise(errors.unexpected_error, error)
            }
        }
        return null
    }
)
