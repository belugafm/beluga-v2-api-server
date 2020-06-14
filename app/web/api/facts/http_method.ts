export const HttpMethods = {
    POST: "POST",
    GET: "GET",
} as const

export type HttpMethodUnion = keyof typeof HttpMethods
