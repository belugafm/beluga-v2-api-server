import { is_string } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    max_length?: number
}
export function check_max_value(value: string, options: Options): void {
    if (options.max_length == null) {
        return
    }
    if (is_string(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length > options.max_length) {
        throw new ValidationError(
            `${options.max_length + 1}文字以上に設定することはできません`
        )
    }
}
