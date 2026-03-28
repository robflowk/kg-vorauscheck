"use client";

import {
	IconBrandGithub,
	IconCalculator,
	IconInfoCircle,
} from "@tabler/icons-react";
import * as React from "react";

import {
	FloatingDock,
	type FloatingDockItem,
} from "@/components/ui/floating-dock";

export function SiteShell({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	const dockItems = React.useMemo<FloatingDockItem[]>(
		() => [
			{
				title: "Rechner",
				icon: <IconCalculator className="h-5 w-5" />,
				href: "/",
			},
			{
				title: "Modell",
				icon: <IconInfoCircle className="h-5 w-5" />,
				href: "/modell",
			},
			{
				title: "GitHub",
				icon: <IconBrandGithub className="h-5 w-5" />,
				href: "https://github.com/robflowk/kg-vorauscheck",
				external: true,
			},
		],
		[],
	);

	return (
		<div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.16),transparent_22%),linear-gradient(180deg,#fffdf8_0%,#f8f4ea_38%,#f4efe4_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_18%),linear-gradient(180deg,#111827_0%,#0f172a_45%,#020617_100%)] dark:text-slate-100">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)] dark:bg-[linear-gradient(to_right,rgba(226,232,240,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.06)_1px,transparent_1px)]" />
			<div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pt-8 pb-28 sm:px-8 lg:px-10">
				<header className="py-1">
					<h1 className="font-heading text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white sm:text-4xl">
						{title}
					</h1>
				</header>

				<main className="mt-6 flex flex-1 flex-col">{children}</main>
			</div>

			<FloatingDock items={dockItems} />
		</div>
	);
}
