export const CommonErrorMessages = {
    InvalidType: "型が不正です",
}
export class ValidationError {
    message?: string
    constructor(message?: string) {
        this.message = message
    }
}
