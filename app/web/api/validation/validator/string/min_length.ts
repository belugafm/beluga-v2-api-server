import { is_string } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    min_length?: number
}
export function check_min_value(value: string, options: Options): void {
    if (options.min_length == null) {
        return
    }
    if (is_string(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length < options.min_length) {
        throw new ValidationError(
            `${options.min_length - 1}文字以下に設定することはできません`
        )
    }
}
