const config: {
    fraud_prevention: {
        enabled: boolean
        isp_deny_list: string[]
        isp_allow_list: string[]
        ipqs_api_secret: string
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
    user: {
        name: {
            min_length: number
            max_length: number
            regexp: object
        }
    }
} = {
    // IP Quality ScoreのサービスによるIPアドレスの不信度スコアを利用して
    // ユーザーのBeluga利用を制限する
    fraud_prevention: {
        enabled: false,
        isp_deny_list: [],
        isp_allow_list: [],
        ipqs_api_secret: "",
    },
    user_registration: {
        // 同じIPアドレスでの登録はこの秒数の間隔より短く行えないようになる
        limit: 2,

        // 登録後にサイトを利用しないままこの秒数が経過したアカウントは
        // 休眠アカウントにする
        reclassify_inactive_as_dormant_period: 2 * 3,

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
    user: {
        name: {
            min_length: 1,
            max_length: 32,
            regexp: new RegExp(/^[a-zA-Z0-9_]+$/),
        },
    },
}

export default config
