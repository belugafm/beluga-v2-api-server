import { HttpMethodUnion } from "./facts/http_method"
import { TokenTypesUnion } from "./facts/token_type"
import { RateLimitUnion } from "./facts/rate_limit"
import { ScopesUnion } from "./facts/scope"
import { AuthenticationMethodsUnion } from "./facts/authentication_method"
import { ContentTypesUnion } from "./facts/content_type"

interface AcceptedScopeItem {
    token_type: TokenTypesUnion
    scope: ScopesUnion
}

export interface MethodSpecification {
    // Web APIのURLの末尾
    // https://beluga.cx/api/xxxx/yyyy
    // ↑xsxx/yyyyの部分
    url: string

    // GETかPOSTか
    // それ以外のHTTP Methodは基本使わない
    http_method: HttpMethodUnion

    // 規制レベルをトークンの種類ごとに設定する
    // UserトークンとBotトークンで規制レベルを異なる設定にすることがある
    rate_limiting: { [TokenType in TokenTypesUnion]?: RateLimitUnion }

    // Web APIをリクエストするときのContent-Type
    accepted_content_types: ContentTypesUnion[]

    // Web APIをリクエストする時の認証方法
    accepted_authentication_methods: AuthenticationMethodsUnion[]

    // Web APIを利用可能なスコープを指定
    // 複数指定可
    accepted_scopes: AcceptedScopeItem[]

    // 簡易的な説明
    // 詳細な説明はドキュメントの方で書く
    description: string[]
}
