import { is_string } from "../../functions"
import { ValueSchemaValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    min_length?: number
}
export function check_min_length(value: string, options: Options): void {
    if (options.min_length == null) {
        return
    }
    if (is_string(value) !== true) {
        throw new ValueSchemaValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length < options.min_length) {
        throw new ValueSchemaValidationError(
            `${options.min_length}文字以上に設定してください`
        )
    }
}
