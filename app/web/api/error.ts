export class ApiRuntimeError extends Error {
    description?: string[]
    hint?: string[]
    constructor(message?: string, description?: string[], hint?: string[]) {
        super(message)
        this.description = description
        this.hint = hint
    }
}

export class InternalErrorSpec {
    description = ["サーバー内で問題が発生したため、リクエストを完了できません"]
    hint = ["サイトの管理者に問い合わせてください"]
}
