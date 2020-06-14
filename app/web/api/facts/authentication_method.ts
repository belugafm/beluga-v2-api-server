export const AuthenticationMethods = {
    Cookie: "Cookie",
    AccessToken: "AccessToken",
    OAuth: "OAuth",
} as const

export type AuthenticationMethodsUnion = keyof typeof AuthenticationMethods
