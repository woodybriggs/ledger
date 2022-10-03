import { Account, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { PresetAccountId } from "../../../../src/schemas/account.schema";
import { UpdateCompanySettingsDto, UpdateCompanySettingsSchema } from "../../../../src/schemas/company-settings.schema";
import { methodHandlerDispatcher } from "../../../../src/utils/api-method-dispatcher";

const client = new PrismaClient()

export type CompanySettingsDto = {
  reportingCurrency: string | null,
  yearEndDate?: Date | undefined,

  nominalVatInputAccount?: Account | undefined
  nominalVatOutputAccount?: Account | undefined
}

const getReportingCurrency = async (): Promise<string | null> => {
  const rootAccount = await client.account.findFirst({ where: { accountId: PresetAccountId.Root }})
  if (!rootAccount) return null
  return rootAccount.denomination
}

const getCompanySettings = async (): Promise<CompanySettingsDto> => {
  return ({
    reportingCurrency: await getReportingCurrency()
  })
}

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<CompanySettingsDto>
) => {
  const result = await getCompanySettings()
  return res.status(200).json(result)
}

const updateReportingCurrency = async (updateCompanySettingsDto: UpdateCompanySettingsDto): Promise<void> => {
  if (updateCompanySettingsDto.reportingCurrency) {
    await client.account.updateMany({
      data: {
        denomination: updateCompanySettingsDto.reportingCurrency
      },
      where: { 
        accountId: {
          in: Object.values(PresetAccountId)
        }
      }}
    )
  }
}

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<CompanySettingsDto | ZodError>
) => {
  const { body } = req;
  
  const parsedResult = UpdateCompanySettingsSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  await updateReportingCurrency(parsedResult.data)

  const result = await getCompanySettings()
  return res.status(200).json(result)
}

export default methodHandlerDispatcher({
  GET: getHandler,
  PATCH: patchHandler
})