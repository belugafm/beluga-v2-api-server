import { Schema } from "../schema"
import { check_min_length } from "../validator/string/min_length"
import { check_max_length } from "../validator/string/max_length"
import { check_regex_pattern } from "../validator/string/regex"
import { Options } from "./string"
import config from "../../config/app"

export function password() {
    const options: Options = {
        min_length: config.user_login_credential.password.min_length,
        max_length: 72, // bcryptは72文字までが有効らしい
    }
    return new Schema<string>(options, [
        check_min_length,
        check_max_length,
        check_regex_pattern,
    ])
}
