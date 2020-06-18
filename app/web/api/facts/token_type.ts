export const TokenTypes = {
    User: "user",
    Bot: "bot",
    Admin: "admin",
} as const

export const TokenTypeSpecs = {
    [TokenTypes.User]: {
        description: [],
    },
    [TokenTypes.Bot]: {
        description: [],
    },
    [TokenTypes.Admin]: {
        description: [],
    },
}

export type TokenTypesLiteralUnion = keyof typeof TokenTypes
