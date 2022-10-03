import { NextApiHandler } from "next";

export interface MethodDispatchers {
  GET?: NextApiHandler;
  POST?: NextApiHandler;
  PUT?: NextApiHandler;
  PATCH?: NextApiHandler;
  DELETE?: NextApiHandler;
}

export const methodHandlerDispatcher =
  (dispatchers: MethodDispatchers): NextApiHandler =>
  (req, res) => {
    const { method } = req;
    const handler =
      dispatchers[method! as "GET" | "POST" | "PUT" | "PATCH" | "DELETE"];
    if (!handler) return res.status(405);
    return handler(req, res);
  };