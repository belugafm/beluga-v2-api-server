import { TurboServer, Request, Response } from "../../turbo"
import signup, { facts } from "../../api/methods/account/signup"
import config from "../../../config/app"
import * as fraud_prevention from "../../../model/fraud_score/ok"
import {
    WebApiRuntimeError,
    FraudPreventionAccessDeniedErrorSpec,
} from "../../api/error"

export default (server: TurboServer) => {
    server.post(facts.url, async (req: Request, res: Response, params: any) => {
        if (config.fraud_prevention.enabled) {
            const ip_address = req.headers["x-real-ip"]
            if ((await fraud_prevention.ok(ip_address)) === true) {
                console.log("OK")
            } else {
                throw new WebApiRuntimeError(
                    new FraudPreventionAccessDeniedErrorSpec()
                )
            }
        }
        await signup({
            name: req.body.name,
            password: req.body.password,
            confirmed_password: req.body.confirmed_password,
        })
        return {
            ok: true,
            message: "hoge page",
        }
    })
}
