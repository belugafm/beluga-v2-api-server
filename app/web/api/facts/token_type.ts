export const TokenTypes = {
    User: "User",
    Bot: "Bot",
    System: "System",
} as const

export const TokenTypeConfiguration = {
    [TokenTypes.User]: {
        limit_per_minite: 1,
        label: "Web API Tier 1",
        description: [
            "この規制レベルは動画のアップロードなどのサーバーに高い負荷がかかる処理を制限するために使用される",
        ],
    },
    [TokenTypes.Bot]: {
        limit_per_minite: 20,
        label: "Web API Tier 2",
        description: [
            "連続した画像のアップロードやプロフィール画像の更新などを規制するために使用される",
        ],
    },
    [TokenTypes.System]: {
        limit_per_minite: 60,
        label: "Web API Tier 3",
        description: ["ほぼすべてのWeb APIで使用される規制レベル"],
    },
}

export type TokenTypesUnion = keyof typeof TokenTypes
