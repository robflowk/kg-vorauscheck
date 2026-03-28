"use client";

import {
	IconCheck,
	IconInfoCircle,
	IconReceiptEuro,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import * as React from "react";

import { SiteShell } from "@/components/site-shell";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovingBorderCard } from "@/components/ui/moving-border";
import {
	calculateKgVorauscheck,
	type PartnerTaxClass,
	type TaxationMode,
} from "@/lib/kg-vorauscheck";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("de-DE", {
	style: "currency",
	currency: "EUR",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const taxationModeOptions: Array<{
	value: TaxationMode;
	label: string;
	description: string;
}> = [
	{
		value: "single",
		label: "Einzelveranlagung",
		description: "Berechnung nur mit deinem eigenen Gewinn.",
	},
	{
		value: "joint",
		label: "Gemeinsamveranlagung",
		description: "Berechnung mit Splitting-Tarif und Partnerin-Einkommen.",
	},
];

const partnerTaxClassOptions: Array<{
	value: PartnerTaxClass;
	label: string;
}> = [
	{ value: "I", label: "Steuerklasse I" },
	{ value: "II", label: "Steuerklasse II" },
	{ value: "III", label: "Steuerklasse III" },
	{ value: "IV", label: "Steuerklasse IV" },
	{ value: "V", label: "Steuerklasse V" },
	{ value: "VI", label: "Steuerklasse VI" },
];

function parseCurrencyInput(value: string) {
	const trimmed = value.trim();

	if (!trimmed) {
		return null;
	}

	let normalized = trimmed.replace(/[€\s]/g, "");

	if (normalized.includes(",")) {
		normalized = normalized.replace(/\./g, "").replace(",", ".");
	} else {
		const parts = normalized.split(".");
		if (parts.length > 2) {
			normalized = parts.join("");
		} else if (parts.length === 2 && parts[1]?.length === 3) {
			normalized = parts.join("");
		}
	}

	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number) {
	return currencyFormatter.format(value);
}

function formatPercent(value: number) {
	return `${percentFormatter.format(value)}%`;
}

export function KgVorauscheckApp() {
	const [annualProfitInput, setAnnualProfitInput] = React.useState("120.000");
	const [currentQuarterlyInput, setCurrentQuarterlyInput] =
		React.useState("2.000");
	const [municipalMultiplierInput, setMunicipalMultiplierInput] =
		React.useState("450");
	const [taxationMode, setTaxationMode] =
		React.useState<TaxationMode>("single");
	const [partnerAnnualIncomeInput, setPartnerAnnualIncomeInput] =
		React.useState("0");
	const [partnerTaxClass, setPartnerTaxClass] =
		React.useState<PartnerTaxClass>("IV");
	const [partnerTaxAlreadyPaidEnabled, setPartnerTaxAlreadyPaidEnabled] =
		React.useState(true);
	const [healthInsuranceCostsInput, setHealthInsuranceCostsInput] =
		React.useState("7.000");
	const [donationInput, setDonationInput] = React.useState("5.000");
	const [churchTaxEnabled, setChurchTaxEnabled] = React.useState(false);
	const [animationKey, setAnimationKey] = React.useState(0);
	const resultRef = React.useRef<HTMLElement>(null);

	const annualProfit = parseCurrencyInput(annualProfitInput);
	const currentQuarterlyPrepayment = parseCurrencyInput(currentQuarterlyInput);
	const municipalMultiplier = parseCurrencyInput(municipalMultiplierInput);
	const partnerAnnualIncome = parseCurrencyInput(partnerAnnualIncomeInput);
	const healthInsuranceCosts = parseCurrencyInput(healthInsuranceCostsInput);
	const donationAmount = parseCurrencyInput(donationInput);
	const isJointTaxation = taxationMode === "joint";

	const isReady =
		annualProfit !== null &&
		currentQuarterlyPrepayment !== null &&
		municipalMultiplier !== null &&
		annualProfit > 0 &&
		currentQuarterlyPrepayment >= 0 &&
		municipalMultiplier > 0 &&
		healthInsuranceCosts !== null &&
		healthInsuranceCosts >= 0 &&
		donationAmount !== null &&
		donationAmount >= 0 &&
		(!isJointTaxation ||
			(partnerAnnualIncome !== null && partnerAnnualIncome >= 0));

	const calculation = React.useMemo(() => {
		if (
			!isReady ||
			annualProfit === null ||
			currentQuarterlyPrepayment === null
		) {
			return null;
		}

		return calculateKgVorauscheck({
			annualProfit,
			currentQuarterlyPrepayment,
			municipalMultiplier,
			taxationMode,
			partnerAnnualIncome: partnerAnnualIncome ?? 0,
			partnerTaxClass,
			healthInsuranceCosts: healthInsuranceCosts ?? 0,
			donationAmount: donationAmount ?? 0,
			churchTaxEnabled,
			partnerTaxAlreadyPaidEnabled,
		});
	}, [
		annualProfit,
		currentQuarterlyPrepayment,
		municipalMultiplier,
		isReady,
		taxationMode,
		partnerAnnualIncome,
		partnerTaxClass,
		healthInsuranceCosts,
		donationAmount,
		churchTaxEnabled,
		partnerTaxAlreadyPaidEnabled,
	]);

	const revealCalculation = React.useCallback(() => {
		if (!isReady) {
			return;
		}

		setAnimationKey((value) => value + 1);

		window.requestAnimationFrame(() => {
			resultRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}, [isReady]);

	const detailGroups = React.useMemo(() => {
		if (!calculation) {
			return [];
		}

		return [
			{
				title: "Eingaben",
				items: [
					[
						"Veranlagung",
						calculation.inputs.taxationMode === "joint"
							? "Gemeinsamveranlagung"
							: "Einzelveranlagung",
					],
					["Hebesatz", formatPercent(calculation.inputs.municipalMultiplier)],
					[
						"Gewinn pro Person und Jahr",
						formatCurrency(calculation.inputs.annualProfit),
					],
					[
						"Gewinn pro Person und Monat",
						formatCurrency(calculation.tradeTax.monthlyProfit),
					],
					["Hinzurechnung", formatCurrency(calculation.inputs.addBackAmount)],
					["Kürzung", formatCurrency(calculation.inputs.deductionAmount)],
					[
						"Kranken- und Pflegeversicherung",
						formatCurrency(calculation.inputs.healthInsuranceCosts),
					],
					["Spenden", formatCurrency(calculation.inputs.donationAmount)],
					[
						"Partnerin-Einkommen",
						formatCurrency(calculation.inputs.partnerAnnualIncome),
					],
					[
						"Partnerin-Steuerklasse",
						`Steuerklasse ${calculation.inputs.partnerTaxClass}`,
					],
					[
						"Steuern der Frau bereits berücksichtigt",
						calculation.inputs.partnerTaxAlreadyPaidEnabled ? "Ja" : "Nein",
					],
					[
						"Bereits gezahlte Steuer Frau",
						formatCurrency(
							calculation.inputs.partnerTaxAlreadyPaidEnabled
								? calculation.partner.roughAnnualIncomeTaxWithSoliAndChurch
								: 0,
						),
					],
				],
			},
			{
				title: "Gewerbesteuer",
				items: [
					["Hebesatz", formatPercent(calculation.inputs.municipalMultiplier)],
					[
						"Gewerbesteuer pro Person",
						formatCurrency(calculation.tradeTax.annualPerPerson),
					],
					[
						"Gewerbesteuer anrechenbar",
						formatCurrency(calculation.tradeTax.creditable),
					],
					[
						"Gewinn nach Gewerbesteuer pro Jahr",
						formatCurrency(calculation.tradeTax.annualProfitAfterTradeTax),
					],
					[
						"Gewinn nach Gewerbesteuer pro Monat",
						formatCurrency(calculation.tradeTax.monthlyProfitAfterTradeTax),
					],
				],
			},
			{
				title: "Einkommensteuer",
				items: [
					[
						"Einkommensteuer (ledig)",
						formatCurrency(calculation.incomeTax.single),
					],
					[
						"Einkommensteuer (Splitting)",
						formatCurrency(calculation.incomeTax.joint),
					],
					[
						"Aktive Berechnung",
						`${calculation.incomeTax.activeLabel} · ${formatCurrency(calculation.incomeTax.active)}`,
					],
					[
						"Solidaritätszuschlag",
						formatCurrency(calculation.incomeTax.solidaritySurcharge),
					],
					["Kirchensteuer", formatCurrency(calculation.incomeTax.churchTax)],
					[
						"Einkommensteuer + Soli + Kirche",
						`${formatCurrency(calculation.incomeTax.annualTaxAfterPartnerPayments)} · ${formatPercent(calculation.incomeTax.combinedRate)}`,
					],
				],
			},
			...(isJointTaxation
				? [
						{
							title: "Partnerin grob",
							items: [
								[
									"Jahresverdienst",
									formatCurrency(calculation.partner.annualIncome),
								],
								[
									"Steuerklasse",
									`Steuerklasse ${calculation.partner.taxClass}`,
								],
								[
									"Grobe Einkommensteuer + Soli",
									`${formatCurrency(calculation.partner.roughAnnualIncomeTaxWithSoli)} · ${formatPercent(calculation.partner.roughRate)}`,
								],
							],
						},
					]
				: []),
			{
				title: "Abgleich",
				items: [
					[
						"Soll-Vorauszahlung je Quartal",
						formatCurrency(calculation.result.targetQuarterlyPrepayment),
					],
					[
						"Aktuelle Vorauszahlung je Quartal",
						formatCurrency(calculation.inputs.currentQuarterlyPrepayment),
					],
					[
						"Jahresdifferenz / Nachzahlung",
						formatCurrency(calculation.result.annualDifference),
					],
				],
			},
		];
	}, [calculation, isJointTaxation]);

	const resultSignal = React.useMemo(() => {
		if (!calculation) {
			return null;
		}

		const difference = calculation.result.annualDifference;

		if (difference <= -1000) {
			return {
				tone: "warning" as const,
				title: "Achtung, du wirst nachzahlen müssen.",
				description: `Deine Vorauszahlung liegt rund ${formatCurrency(Math.abs(difference))} unter dem Ziel.`,
				amountLabel: "Voraussichtliche Nachzahlung",
				amountValue: formatCurrency(Math.abs(difference)),
			};
		}

		if (difference >= 1000) {
			return {
				tone: "positive" as const,
				title: "Du bekommst voraussichtlich Geld zurück.",
				description: `Deine Vorauszahlung liegt rund ${formatCurrency(difference)} über dem Ziel.`,
				amountLabel: "Voraussichtliche Erstattung",
				amountValue: formatCurrency(difference),
			};
		}

		return {
			tone: "balanced" as const,
			title: "Du hast keine große Differenz zu erwarten.",
			description:
				"Die aktuelle Vorauszahlung liegt ziemlich nah am geschätzten Zielwert.",
			amountLabel:
				difference < 0
					? "Voraussichtliche Nachzahlung"
					: "Voraussichtliche Erstattung",
			amountValue: formatCurrency(Math.abs(difference)),
		};
	}, [calculation]);

	const resultCardClasses = resultSignal
		? resultSignal.tone === "warning"
			? {
					inner:
						"border-rose-300/30 bg-[linear-gradient(180deg,rgba(69,10,10,0.98),rgba(127,29,29,0.9))] text-white",
					glow: "bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.95)_0%,rgba(244,63,94,0.5)_36%,transparent_70%)]",
				}
			: resultSignal.tone === "positive"
				? {
						inner:
							"border-emerald-300/30 bg-[linear-gradient(180deg,rgba(6,35,24,0.98),rgba(20,83,45,0.9))] text-white",
						glow: "bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.95)_0%,rgba(16,185,129,0.45)_36%,transparent_70%)]",
					}
				: resultSignal.tone === "balanced"
					? {
							inner:
								"border-white/10 bg-[linear-gradient(180deg,rgba(12,18,28,0.96),rgba(15,23,42,0.92))] text-white",
							glow: "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.9)_0%,rgba(16,185,129,0.55)_38%,transparent_68%)]",
						}
					: {
							inner:
								"border-white/10 bg-[linear-gradient(180deg,rgba(12,18,28,0.96),rgba(15,23,42,0.92))] text-white",
							glow: "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.9)_0%,rgba(16,185,129,0.55)_38%,transparent_68%)]",
						}
		: {
				inner:
					"border-white/10 bg-[linear-gradient(180deg,rgba(12,18,28,0.96),rgba(15,23,42,0.92))] text-white",
				glow: "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.9)_0%,rgba(16,185,129,0.55)_38%,transparent_68%)]",
			};

	return (
		<SiteShell title="KG-Vorauscheck">
			<section className="space-y-8">
				<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
					<div className="space-y-4">
						<div className="flex items-baseline justify-between gap-3">
							<p className="text-xs font-semibold tracking-[0.2em] text-emerald-800 uppercase dark:text-emerald-300">
								Basisdaten
							</p>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Pflichtangaben
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<label
								htmlFor="annual-profit"
								className="space-y-2 md:col-span-2"
							>
								<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Gewinn pro Person und Jahr
								</span>
								<Input
									id="annual-profit"
									inputMode="decimal"
									placeholder="120.000"
									value={annualProfitInput}
									onChange={(event) => setAnnualProfitInput(event.target.value)}
								/>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Beispiel: 120.000 €
								</p>
							</label>

							<label
								htmlFor="current-quarterly"
								className="space-y-2 md:col-span-2"
							>
								<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Aktuelle Vorauszahlung je Quartal
								</span>
								<Input
									id="current-quarterly"
									inputMode="decimal"
									placeholder="2.000"
									value={currentQuarterlyInput}
									onChange={(event) =>
										setCurrentQuarterlyInput(event.target.value)
									}
								/>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Beispiel: 2.000 €
								</p>
							</label>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-baseline justify-between gap-3">
							<p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
								Annahmen
							</p>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Variable Werte
							</p>
						</div>
						<div className="grid gap-4">
							<label htmlFor="municipal-multiplier" className="space-y-2">
								<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Hebesatz
								</span>
								<Input
									id="municipal-multiplier"
									inputMode="decimal"
									placeholder="450"
									value={municipalMultiplierInput}
									onChange={(event) =>
										setMunicipalMultiplierInput(event.target.value)
									}
								/>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Beispiel: 450 %
								</p>
							</label>

							<label htmlFor="health-insurance-costs" className="space-y-2">
								<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Jährliche Kosten Kranken- und Pflegeversicherung
								</span>
								<Input
									id="health-insurance-costs"
									inputMode="decimal"
									placeholder="7.000"
									value={healthInsuranceCostsInput}
									onChange={(event) =>
										setHealthInsuranceCostsInput(event.target.value)
									}
								/>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Beispiel: 7.000 €
								</p>
							</label>

							<label htmlFor="donation-amount" className="space-y-2">
								<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Spenden
								</span>
								<Input
									id="donation-amount"
									inputMode="decimal"
									placeholder="5.000"
									value={donationInput}
									onChange={(event) => setDonationInput(event.target.value)}
								/>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Beispiel: 5.000 €
								</p>
							</label>

							<label htmlFor="church-tax-enabled" className="space-y-2">
								<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Kirchensteuer
								</span>
								<select
									id="church-tax-enabled"
									value={churchTaxEnabled ? "yes" : "no"}
									onChange={(event) =>
										setChurchTaxEnabled(event.target.value === "yes")
									}
									className="flex h-12 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-base text-slate-950 shadow-[0_12px_40px_-22px_rgba(15,23,42,0.35)] outline-none backdrop-blur-sm transition-[border,box-shadow,background,color] focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-amber-100 dark:border-white/10 dark:bg-white/8 dark:text-white dark:focus-visible:border-amber-300 dark:focus-visible:bg-white/12 dark:focus-visible:ring-amber-300/20"
								>
									<option value="no">Ohne Kirchensteuer</option>
									<option value="yes">Mit Kirchensteuer</option>
								</select>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Als grobe Näherung mit 9 % auf die Einkommensteuer.
								</p>
							</label>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex items-baseline justify-between gap-3">
						<p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
							Veranlagung
						</p>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Erst danach erscheinen Partnerinnen-Daten
						</p>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						<label htmlFor="taxation-mode" className="space-y-2 md:col-span-2">
							<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
								Veranlagungsart
							</span>
							<select
								id="taxation-mode"
								value={taxationMode}
								onChange={(event) =>
									setTaxationMode(event.target.value as TaxationMode)
								}
								className="flex h-12 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-base text-slate-950 shadow-[0_12px_40px_-22px_rgba(15,23,42,0.35)] outline-none backdrop-blur-sm transition-[border,box-shadow,background,color] focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-amber-100 dark:border-white/10 dark:bg-white/8 dark:text-white dark:focus-visible:border-amber-300 dark:focus-visible:bg-white/12 dark:focus-visible:ring-amber-300/20"
							>
								{taxationModeOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{
									taxationModeOptions.find(
										(option) => option.value === taxationMode,
									)?.description
								}
							</p>
						</label>

						<div className="hidden md:block" />
					</div>

					{isJointTaxation ? (
						<div className="grid gap-4 md:grid-cols-2">
							<label htmlFor="partner-annual-income" className="space-y-2">
								<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Jahresverdienst deiner Frau
								</span>
								<Input
									id="partner-annual-income"
									inputMode="decimal"
									placeholder="58.000"
									value={partnerAnnualIncomeInput}
									onChange={(event) =>
										setPartnerAnnualIncomeInput(event.target.value)
									}
								/>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Grobe Schätzung für die gemeinsame Rechnung.
								</p>
							</label>

							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
									<label htmlFor="partner-tax-class">
										Steuerklasse deiner Frau
									</label>
									<span className="group relative inline-flex">
										<button
											type="button"
											aria-label="Steuerklassen erklären"
											className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-700 focus-visible:text-slate-700 focus-visible:outline-none dark:text-slate-500 dark:hover:text-slate-200 dark:focus-visible:text-slate-200"
										>
											<IconInfoCircle className="h-4 w-4" />
										</button>
										<span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-white/70 bg-slate-950 px-4 py-3 text-xs leading-5 text-white opacity-0 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.9)] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:border-white/10">
											I: Standard, wenn die Person selbst veranlagt wird.
											<br />
											II: Oft bei Alleinerziehenden.
											<br />
											III: meist der höher Verdienende. V: der niedriger
											Verdienende. III/V ist für ungleiche Einkommen gedacht.
											<br />
											IV: Verheiratet, ähnliche Einkommen.
											<br />
											VI: Für weitere Jobs oder Nebenbeschäftigungen.
										</span>
									</span>
								</div>
								<select
									id="partner-tax-class"
									value={partnerTaxClass}
									onChange={(event) =>
										setPartnerTaxClass(event.target.value as PartnerTaxClass)
									}
									className="flex h-12 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-base text-slate-950 shadow-[0_12px_40px_-22px_rgba(15,23,42,0.35)] outline-none backdrop-blur-sm transition-[border,box-shadow,background,color] focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-amber-100 dark:border-white/10 dark:bg-white/8 dark:text-white dark:focus-visible:border-amber-300 dark:focus-visible:bg-white/12 dark:focus-visible:ring-amber-300/20"
								>
									{partnerTaxClassOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Nutzt den Wert nur als grobe Zusatzannahme.
								</p>
							</div>

							<label className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_12px_40px_-22px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/5 md:col-span-2">
								<input
									type="checkbox"
									checked={partnerTaxAlreadyPaidEnabled}
									onChange={(event) =>
										setPartnerTaxAlreadyPaidEnabled(event.target.checked)
									}
									className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-300 dark:border-slate-600"
								/>
								<div className="space-y-2">
									<span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
										Steuern der Frau bereits berücksichtigt
									</span>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Aktivieren, wenn ihre berechnete Steuer direkt als bereits
										gezahlt abgezogen werden soll.
									</p>
								</div>
							</label>
						</div>
					) : null}
				</div>

				<div className="mt-6 flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={revealCalculation}
						disabled={!isReady}
						className={cn(
							buttonVariants({ size: "lg" }),
							"rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-400",
						)}
					>
						Berechnen
					</button>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						Das Ergebnis erscheint direkt darunter.
					</p>
					<Link
						href="/modell"
						className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
					>
						Annahmen prüfen? Erst ins Modell schauen.
					</Link>
				</div>
			</section>

			<AnimatePresence mode="wait">
				{calculation ? (
					<motion.section
						ref={resultRef}
						key={animationKey}
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -18 }}
						transition={{ duration: 0.45, ease: "easeOut" }}
						className="mt-8"
					>
						<div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,250,252,0.84))] p-6 text-slate-950 shadow-[0_34px_110px_-52px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] dark:text-white dark:shadow-[0_34px_110px_-52px_rgba(15,23,42,0.75)] sm:p-8">
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-white/10 dark:text-amber-300">
									<IconReceiptEuro className="h-5 w-5" />
								</div>
								<div>
									<p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-white/55">
										Berechnungsfluss
									</p>
									<h3 className="font-heading text-2xl font-semibold tracking-[-0.04em]">
										So setzt sich die Schätzung zusammen.
									</h3>
								</div>
							</div>

							<div className="mt-8 overflow-x-auto pb-2">
								<div className="flex min-w-max gap-4">
									{detailGroups.map((group, index) => (
										<motion.div
											key={group.title}
											initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
											animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
											transition={{
												delay: index * 0.14,
												duration: 0.42,
												ease: "easeOut",
											}}
											className="w-[19rem] flex-none rounded-[1.8rem] border border-slate-200/80 bg-white/75 p-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:w-[20rem] lg:w-[21rem]"
										>
											<h4 className="font-heading text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
												{group.title}
											</h4>
											<div className="mt-5 space-y-3">
												{group.items.map(([label, value]) => (
													<div
														key={label}
														className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-3 text-sm last:border-b-0 last:pb-0 dark:border-white/10"
													>
														<span className="text-slate-600 dark:text-slate-300">
															{label}
														</span>
														<span className="text-right font-medium text-slate-950 dark:text-white">
															{value}
														</span>
													</div>
												))}
											</div>
										</motion.div>
									))}
								</div>
							</div>
						</div>

						<MovingBorderCard
							className="mt-6"
							innerClassName={resultCardClasses.inner}
							glowClassName={resultCardClasses.glow}
						>
							<div className="grid gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[0.9fr_1.1fr]">
								<div>
									<p
										className={cn(
											"text-xs font-semibold tracking-[0.2em] uppercase",
											resultSignal?.tone === "warning"
												? "text-rose-200"
												: resultSignal?.tone === "positive"
													? "text-emerald-200"
													: "text-amber-200",
										)}
									>
										Ergebnis
									</p>
									<h3 className="mt-3 flex items-center gap-3 font-heading text-3xl font-semibold tracking-[-0.06em] text-white">
										{resultSignal?.tone === "balanced" ? (
											<span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">
												<IconCheck className="h-6 w-6" />
											</span>
										) : null}
										<span>
											{resultSignal?.title ??
												"Vergleich zur aktuellen Vorauszahlung."}
										</span>
									</h3>
									{resultSignal ? (
										<div className="mt-4 space-y-3">
											<div
												className={cn(
													"rounded-[1.4rem] border px-5 py-4",
													resultSignal.tone === "warning"
														? "border-rose-200/25 bg-rose-500/10"
														: resultSignal.tone === "positive"
															? "border-emerald-200/25 bg-emerald-500/10"
															: resultSignal.amountLabel ===
																	"Voraussichtliche Nachzahlung"
																? "border-rose-200/25 bg-rose-500/10"
																: "border-emerald-200/25 bg-emerald-500/10",
												)}
											>
												<p
													className={cn(
														"text-xs font-semibold tracking-[0.18em] uppercase",
														resultSignal.tone === "warning"
															? "text-rose-100/80"
															: resultSignal.tone === "positive"
																? "text-emerald-100/80"
																: resultSignal.amountLabel ===
																		"Voraussichtliche Nachzahlung"
																	? "text-rose-100/80"
																	: "text-emerald-100/80",
													)}
												>
													{resultSignal.amountLabel}
												</p>
												<p className="mt-2 font-heading text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
													{resultSignal.amountValue}
												</p>
											</div>
											<p
												className={cn(
													"max-w-lg text-sm leading-7",
													resultSignal.tone === "warning"
														? "text-rose-100/90"
														: "text-emerald-100/90",
												)}
											>
												{resultSignal.description}
											</p>
										</div>
									) : null}
								</div>

								<div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5">
									<p className="text-sm text-white/65">
										Voraussichtliche EKSt.
									</p>
									<p className="mt-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-white">
										{formatCurrency(
											calculation.incomeTax.annualTaxAfterPartnerPayments,
										)}
									</p>
									<div className="mt-5 grid gap-4 sm:grid-cols-2">
										{[
											[
												"Vorauszahlung je Quartal",
												formatCurrency(
													calculation.result.targetQuarterlyPrepayment,
												),
											],
											[
												"Abweichung pro Jahr",
												formatCurrency(calculation.result.annualDifference),
											],
										].map(([label, value]) => (
											<div
												key={label}
												className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4"
											>
												<p className="text-sm text-white/65">{label}</p>
												<p className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-white">
													{value}
												</p>
											</div>
										))}
									</div>
								</div>
							</div>
						</MovingBorderCard>
					</motion.section>
				) : null}
			</AnimatePresence>
		</SiteShell>
	);
}
