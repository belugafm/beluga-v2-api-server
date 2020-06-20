export class ModelRuntimeError extends Error {
    code?: string
    constructor(error_code?: string) {
        super()
        this.code = error_code
        Object.setPrototypeOf(this, ModelRuntimeError.prototype)
    }
}
