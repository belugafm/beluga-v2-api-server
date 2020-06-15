import { HttpMethodLiteralUnion } from "./facts/http_method"
import { TokenTypesLiteralUnion } from "./facts/token_type"
import { RateLimitLiteralUnion } from "./facts/rate_limit"
import { ScopesUnion } from "./facts/scope"
import { AuthenticationMethodsLiteralUnion } from "./facts/authentication_method"
import { ContentTypesLiteralUnion } from "./facts/content_type"

interface AcceptedScopeItem {
    token_type: TokenTypesLiteralUnion
    scope: ScopesUnion
}

export interface ErrorInterface {
    description: string
    hint: string | null
}

export interface ArgumentInterface {
    description: string[]
    examples: string[] | null
    required: boolean
}

export interface MethodSpecsInterface {
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

    // 発生しうるエラー
    expected_errors: { [arg: string]: ErrorInterface }

    // Web APIの呼び出し時の引数
    arguments: { [arg: string]: ArgumentInterface }
}
