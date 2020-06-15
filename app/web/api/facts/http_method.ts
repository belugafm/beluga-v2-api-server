export const HttpMethods = {
    POST: "POST",
    GET: "GET",
} as const

export type HttpMethodLiteralUnion = keyof typeof HttpMethods
