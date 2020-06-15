import { MethodSpecification } from "../../specification"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

const ErrorIds = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    InvalidConfirmedPassword: "invalid_confirmed_password",
    NameTaken: "name_taken",
    InternalError: "internal_error",
} as const

const Errors = {
    [ErrorIds.InvalidName]: {
        description: "ユーザー名が基準を満たしていません",
    },
    [ErrorIds.InvalidPassword]: {
        description: "パスワードが基準を満たしていません",
    },
    [ErrorIds.NameTaken]: {
        description:
            "このユーザー名はすでに取得されているため、新規作成できません",
        hint: "別のユーザー名でアカウントを作成してください",
    },
    [ErrorIds.InvalidConfirmedPassword]: {
        description: "確認用のパスワードが一致しません",
        hint: "パスワードと確認用パスワードは同じものを入力してください",
    },
    [ErrorIds.InternalError]: {
        description: "サーバー内で問題が発生し、リクエストを完了できません",
        hint: "サイトの管理者に問い合わせてください",
    },
} as const

interface Specs extends MethodSpecification {
    expected_errors: {
        [ErrorId in typeof ErrorIds[keyof typeof ErrorIds]]: {
            description: string
            hint?: string
        }
    }
}

export const specs: Specs = {
    url: MethodIdentifiers.CreateAccount,
    http_method: HttpMethods.POST,
    rate_limiting: {},
    accepted_content_types: [
        ContentTypes.ApplicationFormUrlEncoded,
        ContentTypes.ApplicationJson,
    ],
    authentication_required: false,
    accepted_authentication_methods: [],
    accepted_scopes: [],
    description: ["新規アカウントを作成します"],
    expected_errors: Errors,
}
