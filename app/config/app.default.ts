const config: {
    fraud_prevention: {
        enabled: boolean
        isp: {
            deny_list: string[]
            allow_list: string[]
        }
        ipqs_api_secret: string
    }
} = {
    // IP Quality ScoreのサービスによるIPアドレスの不信度スコアを利用して
    // ユーザーのBeluga利用を制限する
    fraud_prevention: {
        enabled: false,
        isp: {
            deny_list: [],
            allow_list: [],
        },
        ipqs_api_secret: "",
    },
}

export default config
