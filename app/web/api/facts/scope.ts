export const Scopes = {
    AdminWriteUser: "admin:user:write",
    AdminReadUser: "admin:user:read",
    ReadUser: "user:read",
    WriteUser: "user:read",
    ReadTimeline: "timeline:read",
    WriteTimeline: "timeline:write",
} as const

export type ScopesLiteralUnion = typeof Scopes[keyof typeof Scopes]

export const ScopeSpecs = {
    [Scopes.ReadTimeline]: {
        description: ["チャンネル・スレッドの投稿の読み込み"],
    },
    [Scopes.WriteTimeline]: {
        description: ["チャンネル・スレッドへの書き込み"],
    },
}
