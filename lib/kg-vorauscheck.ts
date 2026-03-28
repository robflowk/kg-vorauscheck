const EURO_CENTS = 100;

export const KG_DEFAULTS = {
	addBackAmount: 0,
	deductionAmount: 0,
	municipalMultiplier: 450,
	taxationMode: "single" as const,
	healthInsuranceCosts: 0,
	donationAmount: 0,
	churchTaxEnabled: false,
} as const;

export type TaxationMode = "single" | "joint";

export type PartnerTaxClass = "I" | "II" | "III" | "IV" | "V" | "VI";

export type KgVorauscheckInput = {
	annualProfit: number;
	currentQuarterlyPrepayment: number;
	addBackAmount?: number;
	deductionAmount?: number;
	municipalMultiplier?: number;
	taxationMode?: TaxationMode;
	partnerAnnualIncome?: number;
	partnerTaxClass?: PartnerTaxClass;
	healthInsuranceCosts?: number;
	donationAmount?: number;
	churchTaxEnabled?: boolean;
	partnerTaxAlreadyPaidEnabled?: boolean;
};

function roundCurrency(value: number) {
	return Math.round((value + Number.EPSILON) * EURO_CENTS) / EURO_CENTS;
}

function roundDownEuro(value: number) {
	return Math.floor(Math.max(0, value));
}

function incomeTaxTariff2024(taxableIncome: number) {
	const x = Math.max(0, taxableIncome);

	if (x <= 11_784) {
		return 0;
	}

	if (x <= 17_005) {
		const y = (x - 11_784) / 10_000;
		return roundDownEuro((954.8 * y + 1_400) * y);
	}

	if (x <= 66_760) {
		const z = (x - 17_005) / 10_000;
		return roundDownEuro((181.19 * z + 2_397) * z + 991.21);
	}

	if (x <= 277_825) {
		return roundDownEuro(0.42 * x - 10_602.13);
	}

	return roundDownEuro(0.45 * x - 18_936.88);
}

function solidaritySurchargeFromExcel(incomeTax: number) {
	return roundCurrency(Math.max(0, incomeTax) * 0.055);
}

function churchTaxFromIncomeTax(incomeTax: number, enabled: boolean) {
	return enabled ? roundCurrency(Math.max(0, incomeTax) * 0.09) : 0;
}

function ratio(value: number, base: number) {
	if (base === 0) {
		return 0;
	}

	return roundCurrency((value / base) * 100);
}

function partnerTaxClassFactor(taxClass: PartnerTaxClass) {
	switch (taxClass) {
		case "I":
			return 1;
		case "II":
			return 0.95;
		case "III":
			return 0.78;
		case "IV":
			return 1;
		case "V":
			return 1.22;
		case "VI":
			return 1.4;
	}
}

export function calculateKgVorauscheck({
	annualProfit,
	currentQuarterlyPrepayment,
	addBackAmount = KG_DEFAULTS.addBackAmount,
	deductionAmount = KG_DEFAULTS.deductionAmount,
	municipalMultiplier = KG_DEFAULTS.municipalMultiplier,
	taxationMode = KG_DEFAULTS.taxationMode,
	partnerAnnualIncome = 0,
	partnerTaxClass = "IV",
	healthInsuranceCosts = KG_DEFAULTS.healthInsuranceCosts,
	donationAmount = KG_DEFAULTS.donationAmount,
	churchTaxEnabled = KG_DEFAULTS.churchTaxEnabled,
	partnerTaxAlreadyPaidEnabled = false,
}: KgVorauscheckInput) {
	const profit = roundCurrency(annualProfit);
	const currentQuarterly = roundCurrency(currentQuarterlyPrepayment);
	const monthlyProfit = roundCurrency(profit / 12);
	const partnerIncome = roundCurrency(Math.max(0, partnerAnnualIncome));
	const healthCosts = roundCurrency(Math.max(0, healthInsuranceCosts));
	const donations = roundCurrency(Math.max(0, donationAmount));
	const isJointTaxation = taxationMode === "joint";
	const combinedIncome = roundCurrency(
		profit + (isJointTaxation ? partnerIncome : 0),
	);
	const singleTaxableIncome = Math.max(0, profit - healthCosts - donations);
	const activeIncomeBase = Math.max(
		0,
		(isJointTaxation ? combinedIncome : profit) - healthCosts - donations,
	);

	const tradeTaxBase = Math.max(0, profit + addBackAmount - deductionAmount);
	const tradeTax = roundCurrency(
		tradeTaxBase * 0.035 * (municipalMultiplier / 100),
	);
	const tradeTaxCredit = roundCurrency(
		Math.min(tradeTax, Math.max(0, profit) * 0.14),
	);

	const annualProfitAfterTradeTax = roundCurrency(profit - tradeTax);
	const monthlyProfitAfterTradeTax = roundCurrency(
		annualProfitAfterTradeTax / 12,
	);

	const incomeTaxSingle = incomeTaxTariff2024(singleTaxableIncome);
	const incomeTaxJoint = incomeTaxTariff2024(activeIncomeBase / 2) * 2;
	const incomeTaxSelected = isJointTaxation ? incomeTaxJoint : incomeTaxSingle;
	const solidaritySurchargeSelected =
		solidaritySurchargeFromExcel(incomeTaxSelected);
	const churchTaxSelected = churchTaxFromIncomeTax(
		incomeTaxSelected,
		churchTaxEnabled,
	);
	const annualIncomeTaxWithSoli = roundCurrency(
		incomeTaxSelected + solidaritySurchargeSelected,
	);
	const annualIncomeTaxWithSoliAndChurch = roundCurrency(
		annualIncomeTaxWithSoli + churchTaxSelected,
	);
	const partnerTaxClassAdjustment = partnerTaxClassFactor(partnerTaxClass);
	const partnerAnnualIncomeTax = partnerIncome
		? roundCurrency(
				incomeTaxTariff2024(partnerIncome) * partnerTaxClassAdjustment,
			)
		: 0;
	const partnerSolidaritySurcharge = solidaritySurchargeFromExcel(
		partnerAnnualIncomeTax,
	);
	const partnerChurchTax = churchTaxFromIncomeTax(
		partnerAnnualIncomeTax,
		churchTaxEnabled,
	);
	const partnerAnnualIncomeTaxWithSoli = roundCurrency(
		partnerAnnualIncomeTax + partnerSolidaritySurcharge,
	);
	const partnerAnnualIncomeTaxWithSoliAndChurch = roundCurrency(
		partnerAnnualIncomeTaxWithSoli + partnerChurchTax,
	);
	const partnerTaxAlreadyPaid = partnerTaxAlreadyPaidEnabled
		? partnerAnnualIncomeTaxWithSoliAndChurch
		: 0;
	const annualTaxAfterPartnerPayments = roundCurrency(
		Math.max(0, annualIncomeTaxWithSoliAndChurch - partnerTaxAlreadyPaid),
	);

	const annualNetIncome = roundCurrency(
		annualProfitAfterTradeTax -
			annualIncomeTaxWithSoliAndChurch +
			tradeTaxCredit -
			healthCosts -
			donations,
	);
	const monthlyNetIncome = roundCurrency(annualNetIncome / 12);

	const targetQuarterlyPrepayment = roundCurrency(
		(annualTaxAfterPartnerPayments - tradeTaxCredit) / 4,
	);
	const annualCurrentPrepayment = roundCurrency(currentQuarterly * 4);
	const annualDifference = roundCurrency(
		annualCurrentPrepayment - (annualTaxAfterPartnerPayments - tradeTaxCredit),
	);

	return {
		inputs: {
			annualProfit: profit,
			currentQuarterlyPrepayment: currentQuarterly,
			addBackAmount,
			deductionAmount,
			municipalMultiplier,
			taxationMode,
			partnerAnnualIncome: partnerIncome,
			partnerTaxClass,
			healthInsuranceCosts: healthCosts,
			donationAmount: donations,
			churchTaxEnabled,
			partnerTaxAlreadyPaidEnabled,
		},
		tradeTax: {
			annualPerPerson: tradeTax,
			creditable: tradeTaxCredit,
			annualProfitAfterTradeTax,
			monthlyProfitAfterTradeTax,
			monthlyProfit,
		},
		incomeTax: {
			single: incomeTaxSingle,
			joint: incomeTaxJoint,
			active: incomeTaxSelected,
			activeLabel: isJointTaxation
				? "Gemeinsamveranlagung (Splitting)"
				: "Einzelveranlagung",
			solidaritySurcharge: solidaritySurchargeSelected,
			churchTax: churchTaxSelected,
			annualIncomeTaxWithSoli,
			annualIncomeTaxWithSoliAndChurch,
			annualTaxAfterPartnerPayments,
			activeRate: ratio(incomeTaxSelected, activeIncomeBase),
			solidarityRate: ratio(solidaritySurchargeSelected, activeIncomeBase),
			churchTaxRate: ratio(churchTaxSelected, activeIncomeBase),
			combinedRate: ratio(annualTaxAfterPartnerPayments, activeIncomeBase),
		},
		partner: {
			annualIncome: partnerIncome,
			taxClass: partnerTaxClass,
			roughAnnualIncomeTax: partnerAnnualIncomeTax,
			roughAnnualIncomeTaxWithSoli: partnerAnnualIncomeTaxWithSoli,
			roughAnnualIncomeTaxWithSoliAndChurch:
				partnerAnnualIncomeTaxWithSoliAndChurch,
			roughRate: ratio(partnerAnnualIncomeTaxWithSoli, partnerIncome),
			roughRateWithChurch: ratio(
				partnerAnnualIncomeTaxWithSoliAndChurch,
				partnerIncome,
			),
		},
		result: {
			annualNetIncome,
			monthlyNetIncome,
			targetQuarterlyPrepayment,
			annualCurrentPrepayment,
			annualDifference,
		},
	};
}
