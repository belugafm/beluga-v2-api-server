import { is_string } from "../../functions"
import { ValueSchemaValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    max_length?: number
}
export function check_max_length(value: string, options: Options): void {
    if (options.max_length == null) {
        return
    }
    if (is_string(value) !== true) {
        throw new ValueSchemaValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length > options.max_length) {
        throw new ValueSchemaValidationError(
            `${options.max_length + 1}文字以上に設定することはできません`
        )
    }
}
