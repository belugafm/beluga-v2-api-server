export class ModelRuntimeError extends Error {
    error_code?: string
    constructor(error_code?: string) {
        super()
        this.error_code = error_code
        Object.setPrototypeOf(this, ModelRuntimeError.prototype)
    }
}
