import { SiteShell } from "@/components/site-shell";
import { KG_DEFAULTS } from "@/lib/kg-vorauscheck";

export function ModellPage() {
	return (
		<SiteShell title="KG-Vorauscheck">
			<section className="grid gap-4 xl:grid-cols-3">
				<article className="rounded-[2rem] border border-white/70 bg-white/76 p-6 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.46)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_28px_90px_-44px_rgba(2,6,23,0.95)] xl:col-span-2">
					<p className="text-xs font-semibold tracking-[0.2em] text-emerald-800 uppercase dark:text-emerald-300">
						Umfang
					</p>
					<h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
						Was die aktuelle Version bereits kann
					</h2>
					<div className="mt-5 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
						<p>
							Die aktuelle Version nimmt Gewinn pro Person und Jahr sowie die
							aktuelle Vorauszahlung je Quartal an. Zusätzlich gibt es Eingaben
							für Hebesatz, Kranken- und Pflegeversicherung, Spenden sowie
							Kirchensteuer. Außerdem kann zwischen Einzelveranlagung und
							gemeinsamer Veranlagung gewählt werden. Daraus berechnet der
							Rechner Gewerbesteuer, anrechenbare Gewerbesteuer,
							Einkommensteuer, Solidaritätszuschlag, Kirchensteuer,
							Soll-Vorauszahlung und Jahresdifferenz.
						</p>
						<p>
							Bei gemeinsamer Veranlagung kann außerdem das Einkommen der
							Partnerin, ihre Steuerklasse und ihre berechnete Steuer grob
							mitgeführt werden. Wenn die Checkbox aktiv ist, wird dieser Wert
							automatisch als bereits gezahlt angerechnet. Der Ledig-Wert bleibt
							als Vergleich sichtbar.
						</p>
						<p>
							Der Solidaritätszuschlag folgt der aktuellen Excel-Logik: 5,5 %
							auf die Einkommensteuer. So lassen sich die Beispielwerte 1:1
							nachrechnen.
						</p>
					</div>
				</article>

				<article className="rounded-[2rem] border border-white/70 bg-white/76 p-6 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.46)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_28px_90px_-44px_rgba(2,6,23,0.95)]">
					<p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
						Standardannahmen
					</p>
					<div className="mt-5 space-y-3">
						{[
							["Hinzurechnung", "0,00 €"],
							["Kürzung", "0,00 €"],
							["Hebesatz", `${KG_DEFAULTS.municipalMultiplier}%`],
							["Tarifbasis", "ESt-Tarif 2024"],
							["Kirchensteuer", "9 % auf die Einkommensteuer"],
						].map(([label, value]) => (
							<div
								key={label}
								className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-3 text-sm last:border-b-0 last:pb-0 dark:border-white/10"
							>
								<span className="text-slate-600 dark:text-slate-300">
									{label}
								</span>
								<span className="font-medium text-slate-950 dark:text-white">
									{value}
								</span>
							</div>
						))}
					</div>
				</article>
			</section>

			<section className="mt-6 grid gap-4 lg:grid-cols-3">
				{[
					{
						title: "1. Gewerbesteuer",
						text: "Gewinn plus Hinzurechnung minus Kürzung wird mit 3,5 % Messzahl und dem Hebesatz multipliziert.",
					},
					{
						title: "2. Einkommensteuer",
						text: "Die aktive Prognose folgt der gewählten Veranlagungsart. Der jeweils andere Wert bleibt als Vergleich sichtbar.",
					},
					{
						title: "3. Vorauszahlungs-Abgleich",
						text: "Von Einkommensteuer plus Solidaritätszuschlag wird die anrechenbare Gewerbesteuer abgezogen. Danach wird das Ergebnis auf vier Quartale verteilt und mit der aktuellen Zahlung verglichen.",
					},
				].map((item) => (
					<article
						key={item.title}
						className="rounded-[1.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,238,0.9))] p-6 shadow-[0_24px_72px_-42px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.04))] dark:shadow-[0_24px_72px_-42px_rgba(2,6,23,0.95)]"
					>
						<h3 className="font-heading text-xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
							{item.title}
						</h3>
						<p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
							{item.text}
						</p>
					</article>
				))}
			</section>
		</SiteShell>
	);
}
