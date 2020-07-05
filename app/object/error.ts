export class ObjectTransformationError extends Error {
    constructor(message?: string) {
        super(message)
        Object.setPrototypeOf(this, ObjectTransformationError.prototype)
    }
}
