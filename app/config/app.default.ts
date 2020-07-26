const config: {
    server: {
        domain: string
        port: number
        https: boolean
        get_base_url: () => string
    }
    fraud_prevention: {
        enabled: boolean
        isp_deny_list: string[]
        isp_allow_list: string[]
        ipqs_api_secret: string
    }
    terms_of_service: {
        version: string
    }
    admin: {
        name: string
        password: string
    }
    user_registration: {
        limit: number
        reclassify_inactive_as_dormant_after: number
        reclassify_active_as_dormant_after: number
    }
    user_login_credential: {
        password: {
            salt_rounds: number
            min_length: number
        }
    }
    user_login_session: {
        lifetime: number
    }
    user: {
        name: {
            min_length: number
            max_length: number
            regexp: object
        }
    }
    channel: {
        name: {
            min_length: number
            max_length: number
        }
        description: {
            min_length: number
            max_length: number
        }
        create_limit_per_day: number
    }
    community: {
        name: {
            min_length: number
            max_length: number
        }
        description: {
            min_length: number
            max_length: number
        }
        create_limit_per_day: number
    }
    status: {
        no_editing_after: number
        text: {
            min_length: number
            max_length: number
        }
        like: {
            max_count: number
        }
    }
    in_memory_cache: {
        enabled: boolean
        cache_limit: number
        default_expire_seconds: number
    }
    blocks: {
        enabled: boolean
    }
} = {
    server: {
        domain: "localhost.beluga.fm",
        port: 8080,
        https: false,
        get_base_url: () => {
            if (config.server.https) {
                return `https://${config.server.domain}`
            } else {
                return `http://${config.server.domain}`
            }
        },
    },
    // IP Quality ScoreのサービスによるIPアドレスの不信度スコアを利用して
    // ユーザーのBeluga利用を制限する
    fraud_prevention: {
        enabled: false,
        isp_deny_list: [],
        isp_allow_list: [],
        ipqs_api_secret: "",
    },
    terms_of_service: {
        version: "dc96fc180a405bf5c2d1631ab69444e71bbbd0ac",
    },
    admin: {
        name: "admin",

        // 以下は必ず変更する
        password: "password",
    },
    user_registration: {
        // 同じIPアドレスでの登録はこの秒数の間隔より短く行えないようになる
        limit: 86400,

        // 登録後にサイトを利用しないままこの秒数が経過したアカウントは
        // 休眠アカウントにする
        reclassify_inactive_as_dormant_after: 86400 * 3,

        // サイトを利用していたユーザーが最後に利用してから
        // この秒数経過した場合は休眠アカウントにする
        reclassify_active_as_dormant_after: 86400 * 365 * 3,
    },
    user_login_credential: {
        password: {
            salt_rounds: 10,
            min_length: 8,
        },
    },
    user_login_session: {
        // セッションの期限（秒）
        lifetime: 86400 * 30,
    },
    user: {
        name: {
            min_length: 1,
            max_length: 32,
            regexp: new RegExp(/^[a-zA-Z0-9_]+$/),
        },
    },
    channel: {
        name: {
            min_length: 1,
            max_length: 32,
        },
        description: {
            min_length: 0,
            max_length: 3000,
        },
        // 1日あたりの新規作成可能なチャンネル数
        create_limit_per_day: 10,
    },
    community: {
        name: {
            min_length: 1,
            max_length: 32,
        },
        description: {
            min_length: 0,
            max_length: 3000,
        },
        // 1日あたりの新規作成可能なコミュニティ数
        create_limit_per_day: 2,
    },
    status: {
        // 投稿を編集可能な期間（秒）
        no_editing_after: 60 * 5,
        text: {
            min_length: 0,
            max_length: 3000,
        },
        like: {
            max_count: 10,
        },
    },
    in_memory_cache: {
        enabled: true,
        cache_limit: 1000,
        default_expire_seconds: 600,
    },
    blocks: {
        enabled: false,
    },
}

export default config
