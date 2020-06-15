import { MethodSpecsInterface, ArgumentInterface } from "../../specification"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { define_method } from "../../define"

type ArgumentTypes = {
    [ArgumentName in typeof ArgumentNames[keyof typeof ArgumentNames]]: ArgumentInterface
}

type ExpectedErrorsType = {
    [ErrorId in typeof ErrorIds[keyof typeof ErrorIds]]: {
        description: string
        hint: string | null
    }
}

const ErrorIds = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    InvalidConfirmedPassword: "invalid_confirmed_password",
    NameTaken: "name_taken",
    InternalError: "internal_error",
} as const

const Errors: ExpectedErrorsType = {
    [ErrorIds.InvalidName]: {
        description: "ユーザー名が基準を満たしていません",
        hint: null,
    },
    [ErrorIds.InvalidPassword]: {
        description: "パスワードが基準を満たしていません",
        hint: null,
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
        description:
            "サーバー内で問題が発生したため、リクエストを完了できません",
        hint: "サイトの管理者に問い合わせてください",
    },
}

const ArgumentNames = {
    Name: "name",
    Password: "password",
    ConfirmedPassword: "confirmed_password",
} as const

const Arguments: ArgumentTypes = {
    [ArgumentNames.Name]: {
        description: ["ユーザー名"],
        examples: ["beluga"],
        required: true,
    },
    [ArgumentNames.Password]: {
        description: ["パスワード"],
        examples: null,
        required: true,
    },
    [ArgumentNames.ConfirmedPassword]: {
        description: ["確認用のパスワード"],
        examples: null,
        required: true,
    },
}

interface Specs extends MethodSpecsInterface {
    expected_errors: ExpectedErrorsType
    arguments: ArgumentTypes
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
    arguments: Arguments,
}

export default define_method(specs, async (args) => {
    console.log(args.name, args.confirmed_password, args.password)
})
