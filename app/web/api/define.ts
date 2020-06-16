
interface AcceptedScopeItem {
    token_type: TokenTypesLiteralUnion
    scope: ScopesUnion
}

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


type Argument = {
    description: string[]
    examples: string[] | null
    required: true
    default_value?: any
}

export function define_arguments<T>(
    argument_names: readonly T[],
    argument_specs: {
        [P in T]: Argument
    }
): {
    [P in T]: Argument
} {
    return argument_specs
}

type ExpectedError {
    description: string
    hint: string | null
}

export function define_expected_errors<T>(
    error_names: readonly T[],
    error_specs: {
        [P in T]: ExpectedError
    }
): {
    [P in T]: ExpectedError
} {
    return error_specs
}

type Callback<Arguments, ExpectedErrors> = (
    args: Arguments,
    expected_errors:ExpectedErrors
) => Promise<void>

export function define_method<Arguments, ExpectedErrors>(
    facts: MethodFacts,
    method_arguments: Arguments,
    expected_errors: ExpectedErrors,
    callback: Callback<Arguments, ExpectedErrors>
) {
    return 0
}