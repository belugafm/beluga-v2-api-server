export const CommonErrorMessages = {
    InvalidType: "型が不正です",
}
export class ValueSchemaValidationError extends Error {
    constructor(message?: string) {
        super(message)
        Object.setPrototypeOf(this, ValueSchemaValidationError.prototype)
    }
}
