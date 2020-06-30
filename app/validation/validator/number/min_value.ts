import { is_number } from "../../functions"
import { ValueSchemaValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    min_value?: number
}
export function check_min_value(value: string, options: Options): void {
    if (options.min_value == null) {
        return
    }
    if (is_number(value) !== true) {
        throw new ValueSchemaValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length < options.min_value) {
        throw new ValueSchemaValidationError(
            `${options.min_value}以上の値に設定してください`
        )
    }
}
