import { is_string } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../error"

export type Options = {}
export function check_is_string(value: string, options: Options): void {
    if (is_string(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
