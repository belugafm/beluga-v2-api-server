export class WebApiRuntimeError extends Error {
    description?: string[]
    hint?: string[]
    constructor(message?: string, description?: string[], hint?: string[]) {
        super(message)
        this.description = description
        this.hint = hint
        Object.setPrototypeOf(this, WebApiRuntimeError.prototype)
    }
}

// modelから送出されたエラー
export class InternalErrorSpec {
    description = ["問題が発生したためリクエストを完了できません"]
    hint = ["サイトの管理者に問い合わせてください"]
}

// 実装のバグによるエラー
export class UnexpectedErrorSpec {
    description = ["問題が発生したためリクエストを完了できません"]
    hint = ["サイトの管理者に問い合わせてください"]
}
