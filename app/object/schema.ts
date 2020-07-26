export type UserObject = {
    id: string
    name: string
    display_name: string | null
    profile: {
        avatar_image_url: string
        location: string | null
        description: string | null
        theme_color: string | null
        background_image_url: string | null
    }
    stats: {
        statuses_count: number
    }
    created_at: number
    active: boolean
    dormant: boolean
    muted: boolean
    blocked: boolean
    last_activity_time: number | null
}

export type CommunityObject = {
    id: string
    name: string
    description: string | null
    stats: {
        statuses_count: number
        channels_count: number
    }
    created_at: number
    creator_id: string
    creator: UserObject | null
}

export type ChannelObject = {
    id: string
    name: string
    description: string | null
    stats: {
        statuses_count: number
    }
    created_at: number
    creator_id: string
    creator: UserObject | null
    public: boolean
    community_id: string | null
    community: CommunityObject | null
}

export type StatusObject = {
    id: string
    user_id: string
    user: UserObject | null
    channel_id: string
    channel: ChannelObject | null
    community_id: string | null
    community: CommunityObject | null
    thread_status_id: string | null
    thread_status: StatusObject | null
    text: string
    created_at: number
    public: boolean
    edited: boolean
    favorited: boolean
    comment_count: number
    entities: {
        channels: {
            channel_id: string
            channel: ChannelObject | null
            indices: [number, number]
        }[]
        statuses: {
            status_id: string
            status: StatusObject | null
            indices: [number, number]
        }[]
    }
    likes: {
        count: number
        counts: {
            count: number
            user: UserObject
        }[]
    }
    favorites: {
        count: number
        users: UserObject[]
    }
}
