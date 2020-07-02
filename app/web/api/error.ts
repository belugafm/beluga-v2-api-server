import { ExpectedError } from "./define"

export class WebApiRuntimeError<T extends string, S> extends Error {
    code: T
    description?: string[]
    hint?: string[]
    argument?: any
    additional_message?: string
    constructor(spec: ExpectedError<T, S>, additional_message?: string) {
        super()
        this.code = spec.code
        this.description = spec.description
        this.hint = spec.hint
        this.argument = spec.argument
        this.additional_message = additional_message
        Object.setPrototypeOf(this, WebApiRuntimeError.prototype)
    }
}

// アクセス規制によるエラー
export class FraudPreventionAccessDeniedErrorSpec {
    description = [
        "問題のあるネットワークからのアクセスを検出したため、処理を中断しました",
    ]
    hint = [
        "荒らし対策を強化するため、VPN、プロキシ、Torからのアクセスを遮断しています",
    ]
    code = "fraud_prevention_access_denied" as const
}

export class InvalidContentTypeErrorSpec {
    description = ["許可されていないContent-Typeです"]
    hint = []
    code = "invalid_content_type" as const
}

// modelから送出されたエラー
export class InternalErrorSpec {
    description = ["問題が発生したためリクエストを完了できません"]
    hint = ["サイトの管理者に問い合わせてください"]
    code = "internal_error" as const
}

// 実装のバグによるエラー
export class UnexpectedErrorSpec {
    description = ["問題が発生したためリクエストを完了できません"]
    hint = ["サイトの管理者に問い合わせてください"]
    code = "unexpected_error" as const
}

export function raise<ErrorCode extends string, ArgumentSpecs>(
    spec: ExpectedError<ErrorCode, ArgumentSpecs>,
    source_error?: Error
) {
    if (source_error) {
        throw new WebApiRuntimeError(spec, source_error.message)
    } else {
        throw new WebApiRuntimeError(spec)
    }
}
