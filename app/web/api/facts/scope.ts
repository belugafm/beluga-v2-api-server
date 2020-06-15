import { TokenTypes } from "./token_type"

export const Scopes = {
    AdminWriteUser: "admin:user:write",
    AdminReadUser: "admin:user:read",
    ReadTimeline: "timeline:read",
    WriteTimeline: "timeline:write",
} as const

export type ScopesUnion = typeof Scopes[keyof typeof Scopes]

export const ScopeConfiguration = {
    [Scopes.ReadTimeline]: {
        description: ["チャンネル・スレッドの投稿の読み込み"],
    },
    [Scopes.WriteTimeline]: {
        description: ["チャンネル・スレッドへの書き込み"],
    },
}
