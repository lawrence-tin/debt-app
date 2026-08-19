export interface Currency {
  code: string
  name: string
  symbol: string
  /** Flag emoji of the currency's primary issuing country/region. */
  flag: string
}

/** Currency codes shown at the top of the picker, ahead of the A-Z list. ZAR leads — ClearPath is South Africa-first. */
export const POPULAR_CURRENCY_CODES = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'CHF']

const BY_CODE: Record<string, Currency> = {}

export function getCurrency(code: string): Currency | undefined {
  return BY_CODE[code]
}

export function getCurrencySymbol(code: string): string {
  return BY_CODE[code]?.symbol ?? code
}

/** Best-effort country-to-currency lookup for the visitor's browser locale, covering major economies. */
const REGION_TO_CURRENCY: Record<string, string> = {
  US: 'USD', GB: 'GBP', IE: 'EUR', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', PT: 'EUR',
  BE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR',
  JP: 'JPY', CN: 'CNY', IN: 'INR', KR: 'KRW', SG: 'SGD', HK: 'HKD',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK',
  BR: 'BRL', MX: 'MXN', ZA: 'ZAR', NG: 'NGN', KE: 'KES', EG: 'EGP',
  AE: 'AED', SA: 'SAR', IL: 'ILS', TR: 'TRY', RU: 'RUB', UA: 'UAH',
  PH: 'PHP', ID: 'IDR', MY: 'MYR', TH: 'THB', VN: 'VND', PK: 'PKR',
  BD: 'BDT', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
}

export function guessCurrencyFromLocale(): string {
  // ClearPath is South Africa-first — ZAR is the default unless the visitor's browser
  // locale clearly points to another supported region.
  if (typeof navigator === 'undefined') return 'ZAR'
  for (const locale of navigator.languages ?? [navigator.language]) {
    try {
      const region = new Intl.Locale(locale).maximize().region
      if (region && REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region]
    } catch {
      // ignore unparseable locale
    }
  }
  return 'ZAR'
}

export const CURRENCIES: Currency[] = [
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', flag: '🇦🇫' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'ALL', flag: '🇦🇱' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DZD', flag: '🇩🇿' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲' },
  { code: 'AWG', name: 'Aruban Florin', symbol: 'AWG', flag: '🇦🇼' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', flag: '🇦🇺' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: '$', flag: '🇧🇸' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD', flag: '🇧🇭' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: '$', flag: '🇧🇧' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'BYN', flag: '🇧🇾' },
  { code: 'BZD', name: 'Belize Dollar', symbol: '$', flag: '🇧🇿' },
  { code: 'BMD', name: 'Bermudan Dollar', symbol: '$', flag: '🇧🇲' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'BTN', flag: '🇧🇹' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', flag: '🇧🇴' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', flag: '🇧🇦' },
  { code: 'BWP', name: 'Botswanan Pula', symbol: 'P', flag: '🇧🇼' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'BND', name: 'Brunei Dollar', symbol: '$', flag: '🇧🇳' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'BGN', flag: '🇧🇬' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'BIF', flag: '🇧🇮' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', flag: '🇨🇦' },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'CVE', flag: '🇨🇻' },
  { code: 'XCG', name: 'Caribbean guilder', symbol: 'Cg.', flag: '🇨🇼' },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$', flag: '🇰🇾' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇲' },
  { code: 'XPF', name: 'CFP Franc', symbol: 'CFPF', flag: '🇵🇫' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', flag: '🇰🇲' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'CDF', flag: '🇨🇩' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', flag: '🇨🇷' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'CUC', name: 'Cuban Convertible Peso', symbol: '$', flag: '🇨🇺' },
  { code: 'CUP', name: 'Cuban Peso', symbol: '$', flag: '🇨🇺' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'DJF', flag: '🇩🇯' },
  { code: 'DOP', name: 'Dominican Peso', symbol: '$', flag: '🇩🇴' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', flag: '🇦🇬' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'ERN', flag: '🇪🇷' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'ETB', flag: '🇪🇹' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', flag: '🇫🇰' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: '$', flag: '🇫🇯' },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'GMD', flag: '🇬🇲' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', flag: '🇬🇮' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', flag: '🇬🇳' },
  { code: 'GYD', name: 'Guyanaese Dollar', symbol: '$', flag: '🇬🇾' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'HTG', flag: '🇭🇹' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', flag: '🇭🇰' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'IRR', name: 'Iranian Rial', symbol: 'IRR', flag: '🇮🇷' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD', flag: '🇮🇶' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: '$', flag: '🇯🇲' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JOD', flag: '🇯🇴' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KES', flag: '🇰🇪' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD', flag: '🇰🇼' },
  { code: 'KGS', name: 'Kyrgyz Som', symbol: '⃀', flag: '🇰🇬' },
  { code: 'LAK', name: 'Laotian Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', flag: '🇱🇧' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'LSL', flag: '🇱🇸' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: '$', flag: '🇱🇷' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'LYD', flag: '🇱🇾' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP', flag: '🇲🇴' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'MKD', flag: '🇲🇰' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: '🇲🇬' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MWK', flag: '🇲🇼' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'MVR', flag: '🇲🇻' },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'MRU', flag: '🇲🇷' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: 'Rs', flag: '🇲🇺' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'MDL', flag: '🇲🇩' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', flag: '🇲🇳' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD', flag: '🇲🇦' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MZN', flag: '🇲🇿' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: '$', flag: '🇳🇦' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', flag: '🇳🇵' },
  { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ANG', flag: '🇨🇼' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: '$', flag: '🇹🇼' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', flag: '🇳🇿' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', flag: '🇳🇮' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'KPW', name: 'North Korean Won', symbol: '₩', flag: '🇰🇵' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', flag: '🇴🇲' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', flag: '🇵🇰' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'PAB', flag: '🇵🇦' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'PGK', flag: '🇵🇬' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', flag: '🇵🇾' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'PEN', flag: '🇵🇪' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', flag: '🇶🇦' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', flag: '🇷🇼' },
  { code: 'SVC', name: 'Salvadoran Colón', symbol: 'SVC', flag: '🇸🇻' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WST', flag: '🇼🇸' },
  { code: 'STN', name: 'São Tomé & Príncipe Dobra', symbol: 'Db', flag: '🇸🇹' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'RSD', flag: '🇷🇸' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: 'SCR', flag: '🇸🇨' },
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'SLE', flag: '🇸🇱' },
  { code: 'SLL', name: 'Sierra Leonean Leone (1964—2022)', symbol: 'SLL', flag: '🇸🇱' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$', flag: '🇸🇬' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: '$', flag: '🇸🇧' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'SOS', flag: '🇸🇴' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', flag: '🇸🇸' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰' },
  { code: 'SHP', name: 'St. Helena Pound', symbol: '£', flag: '🇸🇭' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'SDG', flag: '🇸🇩' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', flag: '🇸🇷' },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'SZL', flag: '🇸🇿' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'SYP', name: 'Syrian Pound', symbol: '£', flag: '🇸🇾' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'TJS', flag: '🇹🇯' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TZS', flag: '🇹🇿' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', flag: '🇹🇴' },
  { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: '$', flag: '🇹🇹' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'TND', flag: '🇹🇳' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'TMT', flag: '🇹🇲' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX', flag: '🇺🇬' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'AED', flag: '🇦🇪' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$', flag: '🇺🇾' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'UZS', flag: '🇺🇿' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VUV', flag: '🇻🇺' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'VES', flag: '🇻🇪' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'F CFA', flag: '🇸🇳' },
  { code: 'YER', name: 'Yemeni Rial', symbol: 'YER', flag: '🇾🇪' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'ZWL', name: 'Zimbabwean Dollar (2009–2024)', symbol: 'ZWL', flag: '🇿🇼' },
  { code: 'ZWG', name: 'Zimbabwean Gold', symbol: 'ZWG', flag: '🇿🇼' },
]

for (const c of CURRENCIES) BY_CODE[c.code] = c
