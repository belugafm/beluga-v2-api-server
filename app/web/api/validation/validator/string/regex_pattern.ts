import { is_string } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    regexp?: RegExp
}
export function check_regex_pattern(value: string, options: Options): void {
    if (options.regexp == null) {
        return
    }
    if (is_string(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (options.regexp.test(value) !== true) {
        throw new ValidationError("パターンに一致しません")
    }
}
