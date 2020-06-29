const config: {
    fraud_prevention: {
        enabled: boolean
        isp_deny_list: string[]
        isp_allow_list: string[]
        ipqs_api_secret: string
    }
    user_registration: {
        limit: number
    }
    password: {
        salt_rounds: number
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
        // 同じIPアドレスで連続作成可能になる待ち時間（秒）
        limit: 86400,
    },
    password: {
        salt_rounds: 10,
    },
}

export default config
