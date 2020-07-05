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
    created_at: Date
    is_active: boolean
    is_dormant: boolean
    last_activity_date: Date | null
}

export type CommunityObject = {
    id: string
    name: string
    description: string | null
    stats: {
        statuses_count: number
        channels_count: number
    }
    created_at: Date
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
    created_at: Date
    creator_id: string
    creator: UserObject | null
    is_public: boolean
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
    text: string
    created_at: Date
    is_public: boolean
    is_edited: boolean
    is_deleted: boolean
}
