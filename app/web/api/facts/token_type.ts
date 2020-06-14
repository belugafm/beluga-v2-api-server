export const TokenTypes = {
    User: "User",
    Bot: "Bot",
    System: "System",
} as const

export const TokenTypeConfiguration = {
    [TokenTypes.User]: {
        description: [],
    },
    [TokenTypes.Bot]: {
        description: [],
    },
    [TokenTypes.System]: {
        description: [],
    },
}

export type TokenTypesUnion = keyof typeof TokenTypes
