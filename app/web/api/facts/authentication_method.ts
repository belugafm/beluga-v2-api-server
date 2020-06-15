export const AuthenticationMethods = {
    Cookie: "Cookie",
    AccessToken: "AccessToken",
    OAuth: "OAuth",
} as const

export type AuthenticationMethodsLiteralUnion = keyof typeof AuthenticationMethods
