import { Select, SelectProps } from "@mantine/core"

type CurrencySelectProps = Omit<SelectProps, 'data'>

export const CurrencySelect: React.FC<CurrencySelectProps> = (props) => {
  return (
    <Select
      {...props}
      searchable
      data={currencies.map(c => ({ label: `${c.code} - ${c.currency}`, value: c.code }))}
    />
  )
}

type CurrencyItem = {
  currency: string
  code: string
  precision: string
}

var codePrecisionMap = new Map<string, string>()

export const getCurrencyPrecision = (code: string | null): number => {

  if (!code) return 2

  const hasEntry = codePrecisionMap.has(code)

  if (!hasEntry) {
    codePrecisionMap = new Map<string, string>(currencies.map(c => [c.code, c.precision]))
  }

  const precision = codePrecisionMap.get(code)
  if (!precision) return 2

  const precisionNumber = parseInt(precision);
  if (isNaN(precisionNumber)) return 2

  return precisionNumber

}

const currencies: CurrencyItem[] = [
  {
    currency: "Afghani",
    code: "AFN",
    precision: "2"
  },
  {
    currency: "Euro",
    code: "EUR",
    precision: "2"
  },
  {
    currency: "Lek",
    code: "ALL",
    precision: "2"
  },
  {
    currency: "Algerian Dinar",
    code: "DZD",
    precision: "2"
  },
  {
    currency: "US Dollar",
    code: "USD",
    precision: "2"
  },
  {
    currency: "Kwanza",
    code: "AOA",
    precision: "2"
  },
  {
    currency: "East Caribbean Dollar",
    code: "XCD",
    precision: "2"
  },
  {
    currency: "No universal currency",
    code: "",
    precision: ""
  },
  {
    currency: "Argentine Peso",
    code: "ARS",
    precision: "2"
  },
  {
    currency: "Armenian Dram",
    code: "AMD",
    precision: "2"
  },
  {
    currency: "Aruban Florin",
    code: "AWG",
    precision: "2"
  },
  {
    currency: "Australian Dollar",
    code: "AUD",
    precision: "2"
  },
  {
    currency: "Azerbaijanian Manat",
    code: "AZN",
    precision: "2"
  },
  {
    currency: "Bahamian Dollar",
    code: "BSD",
    precision: "2"
  },
  {
    currency: "Bahraini Dinar",
    code: "BHD",
    precision: "3"
  },
  {
    currency: "Taka",
    code: "BDT",
    precision: "2"
  },
  {
    currency: "Barbados Dollar",
    code: "BBD",
    precision: "2"
  },
  {
    currency: "Belarussian Ruble",
    code: "BYR",
    precision: "0"
  },
  {
    currency: "Belize Dollar",
    code: "BZD",
    precision: "2"
  },
  {
    currency: "CFA Franc BCEAO",
    code: "XOF",
    precision: "0"
  },
  {
    currency: "Bermudian Dollar",
    code: "BMD",
    precision: "2"
  },
  {
    currency: "Ngultrum",
    code: "BTN",
    precision: "2"
  },
  {
    currency: "Indian Rupee",
    code: "INR",
    precision: "2"
  },
  {
    currency: "Boliviano",
    code: "BOB",
    precision: "2"
  },
  {
    currency: "Mvdol",
    code: "BOV",
    precision: "2"
  },
  {
    currency: "Convertible Mark",
    code: "BAM",
    precision: "2"
  },
  {
    currency: "Pula",
    code: "BWP",
    precision: "2"
  },
  {
    currency: "Norwegian Krone",
    code: "NOK",
    precision: "2"
  },
  {
    currency: "Brazilian Real",
    code: "BRL",
    precision: "2"
  },
  {
    currency: "Brunei Dollar",
    code: "BND",
    precision: "2"
  },
  {
    currency: "Bulgarian Lev",
    code: "BGN",
    precision: "2"
  },
  {
    currency: "Burundi Franc",
    code: "BIF",
    precision: "0"
  },
  {
    currency: "Riel",
    code: "KHR",
    precision: "2"
  },
  {
    currency: "CFA Franc BEAC",
    code: "XAF",
    precision: "0"
  },
  {
    currency: "Canadian Dollar",
    code: "CAD",
    precision: "2"
  },
  {
    currency: "Cabo Verde Escudo",
    code: "CVE",
    precision: "2"
  },
  {
    currency: "Cayman Islands Dollar",
    code: "KYD",
    precision: "2"
  },
  {
    currency: "Unidad de Fomento",
    code: "CLF",
    precision: "4"
  },
  {
    currency: "Chilean Peso",
    code: "CLP",
    precision: "0"
  },
  {
    currency: "Yuan Renminbi",
    code: "CNY",
    precision: "2"
  },
  {
    currency: "Colombian Peso",
    code: "COP",
    precision: "2"
  },
  {
    currency: "Unidad de Valor Real",
    code: "COU",
    precision: "2"
  },
  {
    currency: "Comoro Franc",
    code: "KMF",
    precision: "0"
  },
  {
    currency: "Congolese Franc",
    code: "CDF",
    precision: "2"
  },
  {
    currency: "New Zealand Dollar",
    code: "NZD",
    precision: "2"
  },
  {
    currency: "Costa Rican Colon",
    code: "CRC",
    precision: "2"
  },
  {
    currency: "Croatian Kuna",
    code: "HRK",
    precision: "2"
  },
  {
    currency: "Peso Convertible",
    code: "CUC",
    precision: "2"
  },
  {
    currency: "Cuban Peso",
    code: "CUP",
    precision: "2"
  },
  {
    currency: "Netherlands Antillean Guilder",
    code: "ANG",
    precision: "2"
  },
  {
    currency: "Czech Koruna",
    code: "CZK",
    precision: "2"
  },
  {
    currency: "Danish Krone",
    code: "DKK",
    precision: "2"
  },
  {
    currency: "Djibouti Franc",
    code: "DJF",
    precision: "0"
  },
  {
    currency: "Dominican Peso",
    code: "DOP",
    precision: "2"
  },
  {
    currency: "Egyptian Pound",
    code: "EGP",
    precision: "2"
  },
  {
    currency: "El Salvador Colon",
    code: "SVC",
    precision: "2"
  },
  {
    currency: "Nakfa",
    code: "ERN",
    precision: "2"
  },
  {
    currency: "Ethiopian Birr",
    code: "ETB",
    precision: "2"
  },
  {
    currency: "Falkland Islands Pound",
    code: "FKP",
    precision: "2"
  },
  {
    currency: "Fiji Dollar",
    code: "FJD",
    precision: "2"
  },
  {
    currency: "CFP Franc",
    code: "XPF",
    precision: "0"
  },
  {
    currency: "Dalasi",
    code: "GMD",
    precision: "2"
  },
  {
    currency: "Lari",
    code: "GEL",
    precision: "2"
  },
  {
    currency: "Ghana Cedi",
    code: "GHS",
    precision: "2"
  },
  {
    currency: "Gibraltar Pound",
    code: "GIP",
    precision: "2"
  },
  {
    currency: "Quetzal",
    code: "GTQ",
    precision: "2"
  },
  {
    currency: "Pound Sterling",
    code: "GBP",
    precision: "2"
  },
  {
    currency: "Guinea Franc",
    code: "GNF",
    precision: "0"
  },
  {
    currency: "Guyana Dollar",
    code: "GYD",
    precision: "2"
  },
  {
    currency: "Gourde",
    code: "HTG",
    precision: "2"
  },
  {
    currency: "Lempira",
    code: "HNL",
    precision: "2"
  },
  {
    currency: "Hong Kong Dollar",
    code: "HKD",
    precision: "2"
  },
  {
    currency: "Forint",
    code: "HUF",
    precision: "2"
  },
  {
    currency: "Iceland Krona",
    code: "ISK",
    precision: "0"
  },
  {
    currency: "Rupiah",
    code: "IDR",
    precision: "2"
  },
  {
    currency: "SDR (Special Drawing Right)",
    code: "XDR",
    precision: "N.A."
  },
  {
    currency: "Iranian Rial",
    code: "IRR",
    precision: "2"
  },
  {
    currency: "Iraqi Dinar",
    code: "IQD",
    precision: "3"
  },
  {
    currency: "New Israeli Sheqel",
    code: "ILS",
    precision: "2"
  },
  {
    currency: "Jamaican Dollar",
    code: "JMD",
    precision: "2"
  },
  {
    currency: "Yen",
    code: "JPY",
    precision: "0"
  },
  {
    currency: "Jordanian Dinar",
    code: "JOD",
    precision: "3"
  },
  {
    currency: "Tenge",
    code: "KZT",
    precision: "2"
  },
  {
    currency: "Kenyan Shilling",
    code: "KES",
    precision: "2"
  },
  {
    currency: "North Korean Won",
    code: "KPW",
    precision: "2"
  },
  {
    currency: "Won",
    code: "KRW",
    precision: "0"
  },
  {
    currency: "Kuwaiti Dinar",
    code: "KWD",
    precision: "3"
  },
  {
    currency: "Som",
    code: "KGS",
    precision: "2"
  },
  {
    currency: "Kip",
    code: "LAK",
    precision: "2"
  },
  {
    currency: "Lebanese Pound",
    code: "LBP",
    precision: "2"
  },
  {
    currency: "Loti",
    code: "LSL",
    precision: "2"
  },
  {
    currency: "Rand",
    code: "ZAR",
    precision: "2"
  },
  {
    currency: "Liberian Dollar",
    code: "LRD",
    precision: "2"
  },
  {
    currency: "Libyan Dinar",
    code: "LYD",
    precision: "3"
  },
  {
    currency: "Swiss Franc",
    code: "CHF",
    precision: "2"
  },
  {
    currency: "Pataca",
    code: "MOP",
    precision: "2"
  },
  {
    currency: "Denar",
    code: "MKD",
    precision: "2"
  },
  {
    currency: "Malagasy Ariary",
    code: "MGA",
    precision: "2"
  },
  {
    currency: "Kwacha",
    code: "MWK",
    precision: "2"
  },
  {
    currency: "Malaysian Ringgit",
    code: "MYR",
    precision: "2"
  },
  {
    currency: "Rufiyaa",
    code: "MVR",
    precision: "2"
  },
  {
    currency: "Ouguiya",
    code: "MRO",
    precision: "2"
  },
  {
    currency: "Mauritius Rupee",
    code: "MUR",
    precision: "2"
  },
  {
    currency: "ADB Unit of Account",
    code: "XUA",
    precision: "N.A."
  },
  {
    currency: "Mexican Peso",
    code: "MXN",
    precision: "2"
  },
  {
    currency: "Mexican Unidad de Inversion (UDI)",
    code: "MXV",
    precision: "2"
  },
  {
    currency: "Moldovan Leu",
    code: "MDL",
    precision: "2"
  },
  {
    currency: "Tugrik",
    code: "MNT",
    precision: "2"
  },
  {
    currency: "Moroccan Dirham",
    code: "MAD",
    precision: "2"
  },
  {
    currency: "Mozambique Metical",
    code: "MZN",
    precision: "2"
  },
  {
    currency: "Kyat",
    code: "MMK",
    precision: "2"
  },
  {
    currency: "Namibia Dollar",
    code: "NAD",
    precision: "2"
  },
  {
    currency: "Nepalese Rupee",
    code: "NPR",
    precision: "2"
  },
  {
    currency: "Cordoba Oro",
    code: "NIO",
    precision: "2"
  },
  {
    currency: "Naira",
    code: "NGN",
    precision: "2"
  },
  {
    currency: "Rial Omani",
    code: "OMR",
    precision: "3"
  },
  {
    currency: "Pakistan Rupee",
    code: "PKR",
    precision: "2"
  },
  {
    currency: "Balboa",
    code: "PAB",
    precision: "2"
  },
  {
    currency: "Kina",
    code: "PGK",
    precision: "2"
  },
  {
    currency: "Guarani",
    code: "PYG",
    precision: "0"
  },
  {
    currency: "Nuevo Sol",
    code: "PEN",
    precision: "2"
  },
  {
    currency: "Philippine Peso",
    code: "PHP",
    precision: "2"
  },
  {
    currency: "Zloty",
    code: "PLN",
    precision: "2"
  },
  {
    currency: "Qatari Rial",
    code: "QAR",
    precision: "2"
  },
  {
    currency: "New Romanian Leu",
    code: "RON",
    precision: "2"
  },
  {
    currency: "Russian Ruble",
    code: "RUB",
    precision: "2"
  },
  {
    currency: "Rwanda Franc",
    code: "RWF",
    precision: "0"
  },
  {
    currency: "Saint Helena Pound",
    code: "SHP",
    precision: "2"
  },
  {
    currency: "Tala",
    code: "WST",
    precision: "2"
  },
  {
    currency: "Dobra",
    code: "STD",
    precision: "2"
  },
  {
    currency: "Saudi Riyal",
    code: "SAR",
    precision: "2"
  },
  {
    currency: "Serbian Dinar",
    code: "RSD",
    precision: "2"
  },
  {
    currency: "Seychelles Rupee",
    code: "SCR",
    precision: "2"
  },
  {
    currency: "Leone",
    code: "SLL",
    precision: "2"
  },
  {
    currency: "Singapore Dollar",
    code: "SGD",
    precision: "2"
  },
  {
    currency: "Sucre",
    code: "XSU",
    precision: "N.A."
  },
  {
    currency: "Solomon Islands Dollar",
    code: "SBD",
    precision: "2"
  },
  {
    currency: "Somali Shilling",
    code: "SOS",
    precision: "2"
  },
  {
    currency: "South Sudanese Pound",
    code: "SSP",
    precision: "2"
  },
  {
    currency: "Sri Lanka Rupee",
    code: "LKR",
    precision: "2"
  },
  {
    currency: "Sudanese Pound",
    code: "SDG",
    precision: "2"
  },
  {
    currency: "Surinam Dollar",
    code: "SRD",
    precision: "2"
  },
  {
    currency: "Lilangeni",
    code: "SZL",
    precision: "2"
  },
  {
    currency: "Swedish Krona",
    code: "SEK",
    precision: "2"
  },
  {
    currency: "WIR Euro",
    code: "CHE",
    precision: "2"
  },
  {
    currency: "WIR Franc",
    code: "CHW",
    precision: "2"
  },
  {
    currency: "Syrian Pound",
    code: "SYP",
    precision: "2"
  },
  {
    currency: "New Taiwan Dollar",
    code: "TWD",
    precision: "2"
  },
  {
    currency: "Somoni",
    code: "TJS",
    precision: "2"
  },
  {
    currency: "Tanzanian Shilling",
    code: "TZS",
    precision: "2"
  },
  {
    currency: "Baht",
    code: "THB",
    precision: "2"
  },
  {
    currency: "Pa’anga",
    code: "TOP",
    precision: "2"
  },
  {
    currency: "Trinidad and Tobago Dollar",
    code: "TTD",
    precision: "2"
  },
  {
    currency: "Tunisian Dinar",
    code: "TND",
    precision: "3"
  },
  {
    currency: "Turkish Lira",
    code: "TRY",
    precision: "2"
  },
  {
    currency: "Turkmenistan New Manat",
    code: "TMT",
    precision: "2"
  },
  {
    currency: "Uganda Shilling",
    code: "UGX",
    precision: "0"
  },
  {
    currency: "Hryvnia",
    code: "UAH",
    precision: "2"
  },
  {
    currency: "UAE Dirham",
    code: "AED",
    precision: "2"
  },
  {
    currency: "US Dollar (Next day)",
    code: "USN",
    precision: "2"
  },
  {
    currency: "Uruguay Peso en Unidades Indexadas (URUIURUI)",
    code: "UYI",
    precision: "0"
  },
  {
    currency: "Peso Uruguayo",
    code: "UYU",
    precision: "2"
  },
  {
    currency: "Uzbekistan Sum",
    code: "UZS",
    precision: "2"
  },
  {
    currency: "Vatu",
    code: "VUV",
    precision: "0"
  },
  {
    currency: "Bolivar",
    code: "VEF",
    precision: "2"
  },
  {
    currency: "Dong",
    code: "VND",
    precision: "0"
  },
  {
    currency: "Yemeni Rial",
    code: "YER",
    precision: "2"
  },
  {
    currency: "Zambian Kwacha",
    code: "ZMW",
    precision: "2"
  },
  {
    currency: "Zimbabwe Dollar",
    code: "ZWL",
    precision: "2"
  },
  {
    currency: "Bond Markets Unit European Composite Unit (EURCO)",
    code: "XBA",
    precision: "N.A."
  },
  {
    currency: "Bond Markets Unit European Monetary Unit (E.M.U.-6)",
    code: "XBB",
    precision: "N.A."
  },
  {
    currency: "Bond Markets Unit European Unit of Account 9 (E.U.A.-9)",
    code: "XBC",
    precision: "N.A."
  },
  {
    currency: "Bond Markets Unit European Unit of Account 17 (E.U.A.-17)",
    code: "XBD",
    precision: "N.A."
  },
  {
    currency: "Codes specifically reserved for testing purposes",
    code: "XTS",
    precision: "N.A."
  },
  {
    currency: "The codes assigned for transactions where no currency is involved",
    code: "XXX",
    precision: "N.A."
  },
  {
    currency: "Gold",
    code: "XAU",
    precision: "N.A."
  },
  {
    currency: "Palladium",
    code: "XPD",
    precision: "N.A."
  },
  {
    currency: "Platinum",
    code: "XPT",
    precision: "N.A."
  },
  {
    currency: "Silver",
    code: "XAG",
    precision: "N.A."
  },
  {
    currency: "Bitcoin",
    code: "BTC",
    precision: "8"
  },
  {
    currency: "Ether",
    code: "ETH",
    precision: "8"
  },
  {
    currency: "Avax",
    code: "AVAX",
    precision: "8"
  }
]