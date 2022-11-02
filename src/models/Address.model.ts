import { AddressDto } from "@src/schemas/address.schema";

export class AddressModel {
  constructor(public address?: Partial<AddressDto> | null) {}

  public toString(): string {

    if (!this.address) return '-'

    const {
      addressLine1,
      addressLine2,
      addressLine3,
      addressLine4,
      city,
      provinceStateCounty,
      country,
      zipPostalCode,
    } = this.address;

    return [
      addressLine1,
      addressLine2,
      addressLine3,
      addressLine4,
      city,
      provinceStateCounty,
      country,
      zipPostalCode,
    ]
      .filter(Boolean)
      .join(", ");
  }
}
