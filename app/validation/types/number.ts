import { Schema } from "../schema"
import { check_min_value } from "../validator/number/min_value"
import { check_max_value } from "../validator/number/max_value"
import { check_is_number } from "../validator/number/is_number"

export type Options = {
    min_value?: number
    max_value?: number
    regexp?: object
}
export function number(options?: Options) {
    return new Schema<number>(options || {}, [
        check_is_number,
        check_min_value,
        check_max_value,
    ])
}
