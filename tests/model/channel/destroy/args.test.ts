import { env } from "../../../mongodb"
import { destroy, ErrorCodes } from "../../../../app/model/channel/destroy"
import { ModelRuntimeError } from "../../../../app/model/error"

describe("channel/destroy", () => {
    beforeAll(async () => {
        await env.connect()
    })
    afterAll(async () => {
        await env.disconnect()
    })
    test("invalid channel_id", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            await destroy({})
        } catch (error) {
            expect(error).toBeInstanceOf(ModelRuntimeError)
            if (error instanceof ModelRuntimeError) {
                expect(error.code).toMatch(ErrorCodes.InvalidArgChannelId)
            }
        }
    })
})
