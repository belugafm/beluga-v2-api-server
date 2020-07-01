import { Schema } from "../schema"
import { check_is_string } from "../validator/string/is_string"
import { check_regex_pattern } from "../validator/string/regex"
import { Options } from "./string"

export function ip_address() {
    const options: Options = {
        regexp: new RegExp(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
    }
    return new Schema<string>(options, [check_is_string, check_regex_pattern])
}
