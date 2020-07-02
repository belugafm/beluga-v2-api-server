const config: {
    server: {
        domain: string
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
    user_registration: {
        limit: number
        reclassify_inactive_as_dormant_period: number
        reclassify_active_as_dormant_period: number
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
    }
} = {
    server: {
        domain: "localhost.beluga.fm",
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
    user_registration: {
        // 同じIPアドレスでの登録はこの秒数の間隔より短く行えないようになる
        limit: 86400,

        // 登録後にサイトを利用しないままこの秒数が経過したアカウントは
        // 休眠アカウントにする
        reclassify_inactive_as_dormant_period: 86400 * 3,

        // サイトを利用していたユーザーが最後に利用してから
        // この秒数経過した場合は休眠アカウントにする
        reclassify_active_as_dormant_period: 86400 * 365 * 3,
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
    },
}

export default config
