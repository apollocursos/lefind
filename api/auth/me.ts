import { publicUser, userFromLocalRequest } from "../../server/_core/localSession";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    return res.status(200).json({ user: publicUser(await userFromLocalRequest(req)) });
  } catch (error) {
    console.error("[Auth] me failed", error);
    return res.status(200).json({ user: null });
  }
}
