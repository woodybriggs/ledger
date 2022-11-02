import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";
import { NextApiRequest, NextApiResponse } from "next";

const listBanks = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {}

export default methodHandlerDispatcher({
  GET: listBanks
})