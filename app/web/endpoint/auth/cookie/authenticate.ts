import { TurboServer, Request, Response } from "../../../turbo"
import authenticate, {
    facts,
} from "../../../api/methods/auth/cookie/authenticate"
import mongoose from "mongoose"

export default (server: TurboServer) => {
    server.post(facts, async (req: Request, res: Response, params: any) => {
        const user_id_str = req.cookies["user_id"]
        const session_id = req.cookies["session_id"]
        if ((!!user_id_str && !!session_id) !== true) {
            return {
                ok: true,
                user: null,
                logged_out: false,
            }
        }
        const user = await authenticate({
            user_id: mongoose.Types.ObjectId(user_id_str),
            session_id: session_id,
        })
        if (user == null) {
            return {
                ok: true,
                user: null,
                logged_out: true,
            }
        }
        return {
            ok: true,
            user: user.transform(),
            logged_out: false,
        }
    })
}
