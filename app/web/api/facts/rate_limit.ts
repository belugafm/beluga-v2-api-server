export const RateLimits = {
    Tier1: "Tier1",
    Tier2: "Tier2",
    Tier3: "Tier3",
    Tier4: "Tier4",
    InternalSystem: "InternalSystem",
} as const

export const RateLimitConfiguration = {
    [RateLimits.Tier1]: {
        limit_per_minite: 1,
        label: "Web API Tier 1",
        description: [
            "動画のアップロードなどのサーバーに高い負荷がかかる処理を制限するために使用されます",
        ],
    },
    [RateLimits.Tier2]: {
        limit_per_minite: 20,
        label: "Web API Tier 2",
        description: [
            "連続した画像のアップロードやプロフィール画像の更新などを規制するために使用されます",
        ],
    },
    [RateLimits.Tier3]: {
        limit_per_minite: 60,
        label: "Web API Tier 3",
        description: ["すべてのWeb APIで使用されるデフォルトの規制レベルです"],
    },
    [RateLimits.Tier4]: {
        limit_per_minite: 200,
        label: "Web API Tier 4",
        description: [
            "ユーザーとのインタラクションが多いボットのための高頻度なリクエストが可能な規制レベルです",
        ],
    },
    [RateLimits.InternalSystem]: {
        limit_per_minite: -1,
        label: "Internal System",
        description: ["利用できません"],
    },
} as const

export type RateLimitUnion = keyof typeof RateLimits
