export const TokenTypes = {
    User: "User",
    Bot: "Bot",
    Admin: "Admin",
} as const

export const TokenTypeConfiguration = {
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
