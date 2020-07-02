export class Schema<T> {
    // validatorの対応する型を推論するためにダミーの関数を作って組み込み関数ReturnTypeで型を推論する
    type(value: T) {
        return value
    }
    options: { [key: string]: any }
    validation_funcs: ((value: T, options: { [key: string]: any }) => void)[]
    constructor(options: { [key: string]: any }, validation_funcs: any[]) {
        this.options = options
        this.validation_funcs = validation_funcs
    }
    check(value: T): void {
        this.validation_funcs.forEach((check) => {
            check(value, this.options)
        })
    }
    ok(value: T): boolean {
        try {
            this.validation_funcs.forEach((check) => {
                check(value, this.options)
            })
        } catch (error) {
            return false
        }
        return true
    }
}
