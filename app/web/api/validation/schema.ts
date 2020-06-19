export class Schema<T> {
    options: { [key: string]: any }
    validation_funcs: ((value: T, options: { [key: string]: any }) => void)[]
    constructor(options: { [key: string]: any }, validation_funcs: any[]) {
        this.options = options
        this.validation_funcs = validation_funcs
    }
    check(value: T) {
        this.validation_funcs.forEach((check) => {
            check(value, this.options)
        })
    }
}
