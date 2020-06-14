export const TokenTypes = {
    User: "User",
    Bot: "Bot",
    InternalSystem: "InternalSystem",
} as const

export const TokenTypeConfiguration = {
    [TokenTypes.User]: {
        description: [],
    },
    [TokenTypes.Bot]: {
        description: [],
    },
    [TokenTypes.InternalSystem]: {
        description: [],
    },
}

export type TokenTypesUnion = keyof typeof TokenTypes
