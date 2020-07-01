export const RateLimits = {
    WebTier1: "WebTier1",
    WebTier2: "WebTier2",
    WebTier3: "WebTier3",
    WebTier4: "WebTier4",
    InternalSystem: "InternalSystem",
} as const

export const RateLimitConfiguration = {
    [RateLimits.WebTier1]: {
        limit_per_minite: 1,
        label: "Web API Tier 1",
        description: [
            "動画のアップロードなどのサーバーに高い負荷がかかる処理を制限するために使用されます",
        ],
    },
    [RateLimits.WebTier2]: {
        limit_per_minite: 20,
        label: "Web API Tier 2",
        description: [
            "連続した画像のアップロードやプロフィール画像の更新などを規制するために使用されます",
        ],
    },
    [RateLimits.WebTier3]: {
        limit_per_minite: 60,
        label: "Web API Tier 3",
        description: ["すべてのWeb APIで使用されるデフォルトの規制レベルです"],
    },
    [RateLimits.WebTier4]: {
        limit_per_minite: 200,
        label: "Web API Tier 4",
        description: ["高頻度なリクエストが可能な規制レベルです"],
    },
    [RateLimits.InternalSystem]: {
        limit_per_minite: -1,
        label: "Internal System",
        description: ["利用できません"],
    },
} as const

export type RateLimitLiteralUnion = keyof typeof RateLimits
