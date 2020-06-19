import { TokenTypesLiteralUnion } from "./facts/token_type"
import { ScopesLiteralUnion } from "./facts/scope"
import { HttpMethodLiteralUnion } from "./facts/http_method"
import { RateLimitLiteralUnion } from "./facts/rate_limit"
import { ContentTypesLiteralUnion } from "./facts/content_type"
import { AuthenticationMethodsLiteralUnion } from "./facts/authentication_method"
import { Schema } from "./validation/schema"

interface AcceptedScopeItem {
    token_type: TokenTypesLiteralUnion
    scope: ScopesLiteralUnion
}

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
    accepted_scopes: AcceptedScopeItem[]

    // 簡易的な説明
    // 詳細な説明はドキュメントの方で書く
    description: string[]
}

// Web APIの引数を定義
type Argument<ValueType> = {
    description: string[]
    examples: string[] | null
    required: true
    default_value?: any
    schema: Schema<ValueType>
}

export function define_arguments<ArgumentNames extends string, ValueType>(
    argument_names: readonly ArgumentNames[],
    argument_specs: {
        [P in ArgumentNames]: Argument<ValueType>
    }
): {
    [P in ArgumentNames]: Argument<ValueType>
} {
    return argument_specs
}

// Web APIが送出しうるエラーを定義
type ExpectedError<Arguments> = {
    description: string[]
    hint?: string[]
    argument?: keyof Arguments
}

export function define_expected_errors<ErrorNames extends string, Arguments>(
    error_names: readonly ErrorNames[],
    argument_specs: Arguments,
    error_specs: {
        [ErrorName in ErrorNames]: ExpectedError<Arguments>
    }
): {
    [ErrorName in ErrorNames]: ExpectedError<Arguments>
} {
    return error_specs
}

// Web APIの定義
type Callback<Arguments, E> = (
    args: Arguments,
    expected_errors: E
) => Promise<any>

type ExpectedErrorSpecs<Arguments, ErrorSpecs> = {
    [ErrorCode in keyof ErrorSpecs]: ExpectedError<Arguments>
}

type ReturnType<ArgumentSpecs> = (
    args: { [ArgumentName in keyof ArgumentSpecs]: any }
) => Promise<any>

type ArgumentSpecs<ArgumentNames extends string, ArgumentValue> = {
    [P in ArgumentNames]: Argument<ArgumentValue>
}

// 各Web APIはLiteral Typesで書かれるのでジェネリクスで補完可能にする
export function define_method<
    ErrorSpecs extends { [key: string]: any },
    ArgumentNames extends string,
    ArgumentValue
>(
    facts: MethodFacts,
    method_argument_specs: ArgumentSpecs<ArgumentNames, ArgumentValue>,
    expected_error_specs: ExpectedErrorSpecs<
        ArgumentSpecs<ArgumentNames, ArgumentValue>,
        ErrorSpecs
    >,
    callback: Callback<
        {
            [ArgumentName in keyof ArgumentSpecs<
                ArgumentNames,
                ArgumentValue
            >]: ArgumentValue
        },
        ExpectedErrorSpecs<
            ArgumentSpecs<ArgumentNames, ArgumentValue>,
            ErrorSpecs
        >
    >
): ReturnType<ArgumentSpecs<ArgumentNames, ArgumentValue>> {
    return (
        args: {
            [ArgumentName in keyof ArgumentSpecs<
                ArgumentNames,
                ArgumentValue
            >]: ArgumentValue
        }
    ) => {
        const errors_associated_with_args: {
            [argument_name: string]: ExpectedError<
                ArgumentSpecs<ArgumentNames, ArgumentValue>
            >
        } = {}
        Object.keys(args).forEach((argument_name) => {
            Object.values(expected_error_specs).forEach((error) => {
                if (error.argument === argument_name) {
                    errors_associated_with_args[argument_name] = error
                }
            })
        })
        console.log(errors_associated_with_args)
        return callback(args, expected_error_specs)
    }
}
