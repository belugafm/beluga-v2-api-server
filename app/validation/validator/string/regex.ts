import { is_string } from "../../functions"
import { ValueSchemaValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    regexp?: RegExp
}
export function check_regex_pattern(value: string, options: Options): void {
    if (options.regexp == null) {
        return
    }
    if (is_string(value) !== true) {
        throw new ValueSchemaValidationError(CommonErrorMessages.InvalidType)
    }
    if (options.regexp.test(value) !== true) {
        throw new ValueSchemaValidationError("パターンに一致しません")
    }
}
