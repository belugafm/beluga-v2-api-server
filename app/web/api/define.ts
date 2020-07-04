import { TokenTypesLiteralUnion } from "./facts/token_type"
import { ScopesLiteralUnion } from "./facts/scope"
import { HttpMethodLiteralUnion } from "./facts/http_method"
import { RateLimitLiteralUnion } from "./facts/rate_limit"
import { ContentTypesLiteralUnion } from "./facts/content_type"
import { AuthenticationMethodsLiteralUnion } from "./facts/authentication_method"
import { Schema } from "../../validation/schema"
import { ValueSchemaValidationError } from "../../validation/error"
import { WebApiRuntimeError, InternalErrorSpec, InvalidAuth } from "./error"
import { UserSchema } from "app/schema/user"

// Web APIの仕様を定義
export interface MethodFacts {
    // Web APIのURLの末尾
    // https://beluga.cx/api/xxxx/yyyy
    // ↑xsxx/yyyyの部分
    url: string

    // GETかPOSTか
    // それ以外のHTTP Methodは基本使わない
    http_method: HttpMethodLiteralUnion

    // 規制レベルをトークンの種類ごとに設定する
    // UserトークンとBotトークンで規制レベルを異なる設定にすることがある
    rate_limiting: {
        [TokenType in TokenTypesLiteralUnion]?: RateLimitLiteralUnion
    }

    // Web APIをリクエストするときのContent-Type
    accepted_content_types: ContentTypesLiteralUnion[]

    // Web APIのリクエストの際に認証が必要かどうか
    // falseの場合以下のプロパティは無視される
    // - rate_limiting
    // - accepted_authentication_methods
    // - accepted_scopes
    authentication_required: boolean

    // Web APIをリクエストする時の認証方法
    accepted_authentication_methods: AuthenticationMethodsLiteralUnion[]

    // Web APIを利用可能なスコープを指定
    // 複数指定可
    accepted_scopes: {
        [TokenType in TokenTypesLiteralUnion]?: ScopesLiteralUnion
    }

    // 簡易的な説明
    // 詳細な説明はドキュメントの方で書く
    description: string[]
}

// Web APIの引数を定義
type Argument = {
    description: string[]
    examples: string[] | null
    required: boolean
    default_value?: any
    schema: Schema<any>
}

export const ExampleObjectId = "5efc9d01b8431d8bf6e3611a"

export function define_arguments<
    ArgumentNames extends string,
    ArgumentSpecs extends {
        [ArgumentName in ArgumentNames]: Argument
    }
>(
    argument_names: readonly ArgumentNames[],
    argument_specs: ArgumentSpecs
): {
    [ArgumentName in keyof ArgumentSpecs]: ArgumentSpecs[ArgumentName]
} {
    return argument_specs
}

// Web APIが送出しうるエラーを定義
export type ExpectedError<ErrorCode, ArgumentSpecs> = {
    code: ErrorCode
    description: string[]
    hint?: string[]
    argument?: keyof ArgumentSpecs
}

export function define_expected_errors<
    ErrorCodes extends string,
    ArgumentSpecs
>(
    error_names: readonly ErrorCodes[],
    argument_specs: ArgumentSpecs,
    error_specs: {
        [ErrorCode in ErrorCodes]: ExpectedError<ErrorCode, ArgumentSpecs>
    }
): {
    [ErrorCode in ErrorCodes]: ExpectedError<ErrorCode, ArgumentSpecs>
} {
    return error_specs
}

// Web APIの定義
// 各Web APIはLiteral Typesで書かれるのでジェネリクスで補完可能にする

type ExpectedErrorSpecs<ArgumentSpecs, ErrorSpecs> = {
    [ErrorCode in keyof ErrorSpecs]: ExpectedError<ErrorCode, ArgumentSpecs>
}

export function define_method<
    ArgumentNames extends string,
    ArgumentSpecs extends {
        [ArgumentName in ArgumentNames]: Argument
    },
    ErrorSpecs,
    CallbackReturnType
>(
    facts: MethodFacts,
    method_argument_specs: ArgumentSpecs,
    expected_error_specs: ExpectedErrorSpecs<ArgumentSpecs, ErrorSpecs>,
    callback: (
        args: {
            [ArgumentName in keyof ArgumentSpecs]: ReturnType<
                ArgumentSpecs[ArgumentName]["schema"]["type"]
            >
        },
        errors: ExpectedErrorSpecs<ArgumentSpecs, ErrorSpecs>,
        auth_user?: UserSchema | null
    ) => Promise<CallbackReturnType>
): (
    args: {
        [ArgumentName in keyof ArgumentSpecs]: ReturnType<
            ArgumentSpecs[ArgumentName]["schema"]["type"]
        >
    },
    auth_user?: UserSchema | null
) => Promise<CallbackReturnType> {
    return (
        args: {
            [ArgumentName in keyof ArgumentSpecs]: ReturnType<
                ArgumentSpecs[ArgumentName]["schema"]["type"]
            >
        },
        auth_user?: UserSchema | null
    ) => {
        if (facts.authentication_required) {
            if (auth_user == null) {
                throw new WebApiRuntimeError(new InvalidAuth())
            }
        }
        // 各argumentに関連付けられた、値チェック失敗時のエラーを送出できるようにする
        const errors_associated_with_args: {
            [argument_name: string]: ExpectedError<string, ArgumentSpecs>
        } = {}
        for (const argument_name in method_argument_specs) {
            for (const error_code in expected_error_specs) {
                const error = expected_error_specs[error_code]
                if (error.argument === argument_name) {
                    errors_associated_with_args[argument_name] = error
                }
            }
        }
        // 各argumentの値チェック
        for (const argument_name in method_argument_specs) {
            const { required } = method_argument_specs[argument_name]
            if (required) {
                if (argument_name in args === false) {
                    const error_code =
                        errors_associated_with_args[argument_name].code
                    throw new WebApiRuntimeError({
                        code: error_code,
                        description: [`"${argument_name}"を指定してください`],
                    })
                }
            }
            const value = args[argument_name]
            if (required || value) {
                try {
                    const { schema } = method_argument_specs[argument_name]
                    // @ts-ignore
                    schema.check(value)
                } catch (validation_error) {
                    if (
                        validation_error instanceof ValueSchemaValidationError
                    ) {
                        const error = errors_associated_with_args[argument_name]
                        if (error == null) {
                            throw new WebApiRuntimeError(
                                new InternalErrorSpec(),
                                "引数の値チェックを完了できません"
                            )
                        } else {
                            throw new WebApiRuntimeError(
                                error,
                                validation_error.message
                            )
                        }
                    } else {
                        throw new WebApiRuntimeError(
                            new InternalErrorSpec(),
                            "引数の値チェックを完了できません"
                        )
                    }
                }
            }
        }
        return callback(args, expected_error_specs, auth_user)
    }
}
