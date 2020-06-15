import { MethodSpecsInterface } from "./specification"

type Arguments<Specs extends MethodSpecsInterface> = {
    [ArgumentName in keyof Specs["arguments"]]: number
}

type Callback<Specs extends MethodSpecsInterface> = (
    args: Arguments<Specs>
) => Promise<void>

export function define_method<Specs extends MethodSpecsInterface>(
    specs: Specs,
    callback: Callback<Specs>
) {
    return 1
}
