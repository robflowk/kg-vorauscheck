import {
	IconArrowRight,
	IconCalculator,
	IconInfoCircle,
} from "@tabler/icons-react";
import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export function LandingPage() {
	return (
		<SiteShell title="KG-Vorauscheck">
			<section className="grid gap-4 lg:grid-cols-2">
				<Link
					href="/"
					className="group rounded-[2rem] border border-white/70 bg-white/76 p-7 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.46)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/6 dark:shadow-[0_28px_90px_-44px_rgba(2,6,23,0.95)]"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-300/12 dark:text-amber-200">
						<IconCalculator className="h-5 w-5" />
					</div>
					<h2 className="mt-5 font-heading text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
						Rechner
					</h2>
					<p className="mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
						Jahresgewinn, Veranlagungsart und aktuelle Quartals-Vorauszahlung
						eingeben, Berechnung starten und die voraussichtliche Lücke sofort
						sehen.
					</p>
					<div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-white">
						Rechner öffnen
						<IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</div>
				</Link>

				<Link
					href="/modell"
					className="group rounded-[2rem] border border-white/70 bg-white/76 p-7 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.46)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/6 dark:shadow-[0_28px_90px_-44px_rgba(2,6,23,0.95)]"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-300/12 dark:text-emerald-200">
						<IconInfoCircle className="h-5 w-5" />
					</div>
					<h2 className="mt-5 font-heading text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
						Modell verstehen
					</h2>
					<p className="mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
						Sieh dir Annahmen, Formelblöcke und aktuell feste Parameter an,
						bevor du die Rechnerlogik weiter prüfst.
					</p>
					<div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-white">
						Modell prüfen
						<IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</div>
				</Link>
			</section>
		</SiteShell>
	);
}
