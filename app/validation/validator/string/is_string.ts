import { is_string } from "../../functions"
import { ValueSchemaValidationError, CommonErrorMessages } from "../../error"

export type Options = {}
export function check_is_string(value: string, options: Options): void {
    if (is_string(value) !== true) {
        throw new ValueSchemaValidationError(CommonErrorMessages.InvalidType)
    }
}
