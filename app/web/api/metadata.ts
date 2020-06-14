import { HttpMethodUnion } from "./facts/http_method"
import { TokenTypesUnion } from "./facts/token_type"
import { RateLimitUnion } from "./facts/rate_limit"
import { ScopesUnion } from "./facts/scope"

interface AcceptedScopeItem {
    token_type: TokenTypesUnion
    scope: ScopesUnion
}

export interface MethodMetadata {
    url: string
    http_method: HttpMethodUnion
    rate_limiting: { [token_type in TokenTypesUnion]?: RateLimitUnion }
    accepted_content_types: string[]
    accepted_authentication_methods: string[]
    accepted_scopes: AcceptedScopeItem[]
    description: string[]
}
