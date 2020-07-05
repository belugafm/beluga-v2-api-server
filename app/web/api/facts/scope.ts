export const Scopes = {
    AdminReadUser: "admin:user:read",
    AdminWriteUser: "admin:user:write",
    ReadUser: "user:read",
    WriteUser: "user:write",
    ReadChannel: "channel:read",
    WriteChannel: "channel:write",
    ReadTimeline: "timeline:read",
    WriteTimeline: "timeline:write",
    ReadStatus: "status:read",
    WriteStatus: "status:write",
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
