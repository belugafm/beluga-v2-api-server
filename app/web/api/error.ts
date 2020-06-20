import { ExpectedError } from "./define"

export class WebApiRuntimeError<T> extends Error {
    description?: string[]
    hint?: string[]
    argument?: any
    additional_message?: string
    constructor(spec: ExpectedError<T>, additional_message?: string) {
        super()
        this.description = spec.description
        this.hint = spec.hint
        this.argument = spec.argument
        this.additional_message = additional_message
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
