import { withAPISession } from "@/shared/api/session";
import { withAuth } from "@/shared/api";

export default withAuth(
  withAPISession(async (req, res) => {
    if (req.token && !req.token.admin) {
      return res.status(403).send({ success: false });
    }
    req.session.destroy();
    req.session.set("admin", true);
    await req.session.save();
    return res.status(200).send({ success: true });
  })
);
