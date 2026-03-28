"use client";

import { Moon, SunMedium } from "lucide-react";
import {
	AnimatePresence,
	type MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "motion/react";
import { useTheme } from "next-themes";
import * as React from "react";

import { cn } from "@/lib/utils";

export type FloatingDockItem = {
	title: string;
	icon: React.ReactNode;
	href: string;
	external?: boolean;
};

export function FloatingDock({
	items,
	className,
}: {
	items: FloatingDockItem[];
	className?: string;
}) {
	return (
		<>
			<FloatingDockDesktop items={items} className={className} />
			<FloatingDockMobile items={items} className={className} />
		</>
	);
}

function ThemeDockButton({ className }: { className?: string }) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			aria-label={
				isDark ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren"
			}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className={cn(
				"relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-slate-700 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.5)] backdrop-blur-md transition-colors dark:border-white/10 dark:bg-slate-900/92 dark:text-slate-100 dark:shadow-[0_18px_50px_-20px_rgba(2,6,23,0.95)]",
				className,
			)}
		>
			<SunMedium className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
		</button>
	);
}

function DockLink({
	item,
	children,
}: {
	item: FloatingDockItem;
	children: React.ReactNode;
}) {
	return (
		<a
			href={item.href}
			target={item.external ? "_blank" : undefined}
			rel={item.external ? "noreferrer" : undefined}
			aria-label={item.title}
		>
			{children}
		</a>
	);
}

function FloatingDockMobile({
	items,
	className,
}: {
	items: FloatingDockItem[];
	className?: string;
}) {
	const [open, setOpen] = React.useState(false);

	return (
		<div className={cn("fixed right-5 bottom-5 z-50 md:hidden", className)}>
			<div className="relative flex items-end gap-3">
				<AnimatePresence>
					{open ? (
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 12 }}
							className="absolute right-0 bottom-16 flex flex-col gap-3"
						>
							{items.map((item, index) => (
								<motion.div
									key={item.title}
									initial={{ opacity: 0, scale: 0.92, y: 10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.92, y: 10 }}
									transition={{ delay: index * 0.04 }}
								>
									<DockLink item={item}>
										<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-slate-700 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.5)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/92 dark:text-slate-100 dark:shadow-[0_18px_50px_-20px_rgba(2,6,23,0.95)]">
											{item.icon}
										</div>
									</DockLink>
								</motion.div>
							))}
						</motion.div>
					) : null}
				</AnimatePresence>

				<div className="flex flex-col items-end gap-3">
					<ThemeDockButton />
					<button
						type="button"
						onClick={() => setOpen((value) => !value)}
						className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-slate-950 text-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.75)] backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-[0_20px_60px_-20px_rgba(2,6,23,0.95)]"
						aria-label="Dock umschalten"
					>
						<motion.div
							animate={{ rotate: open ? 45 : 0 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
							className="text-2xl leading-none"
						>
							+
						</motion.div>
					</button>
				</div>
			</div>
		</div>
	);
}

function FloatingDockDesktop({
	items,
	className,
}: {
	items: FloatingDockItem[];
	className?: string;
}) {
	const mouseX = useMotionValue(Infinity);

	return (
		<motion.div
			onMouseMove={(event) => mouseX.set(event.pageX)}
			onMouseLeave={() => mouseX.set(Infinity)}
			className={cn(
				"fixed bottom-6 left-1/2 z-50 hidden -translate-x-1/2 items-end gap-3 rounded-[2rem] border border-white/60 bg-white/82 px-4 py-3 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 dark:shadow-[0_24px_80px_-32px_rgba(2,6,23,0.98)] md:flex",
				className,
			)}
		>
			{items.map((item) => (
				<DockIcon key={item.title} item={item} mouseX={mouseX} />
			))}
			<ThemeDockButton />
		</motion.div>
	);
}

function DockIcon({
	item,
	mouseX,
}: {
	item: FloatingDockItem;
	mouseX: MotionValue<number>;
}) {
	const ref = React.useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = React.useState(false);

	const distance = useTransform(mouseX, (value) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
		return value - bounds.x - bounds.width / 2;
	});

	const width = useSpring(
		useTransform(distance, [-160, 0, 160], [48, 72, 48]),
		{
			mass: 0.12,
			stiffness: 180,
			damping: 14,
		},
	);
	const iconScale = useSpring(
		useTransform(distance, [-160, 0, 160], [1, 1.22, 1]),
		{
			mass: 0.12,
			stiffness: 180,
			damping: 14,
		},
	);

	return (
		<DockLink item={item}>
			<motion.div
				ref={ref}
				style={{ width, height: width }}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				className="relative flex aspect-square items-center justify-center rounded-[1.4rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,238,224,0.92))] text-slate-700 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(15,23,42,0.92))] dark:text-slate-100 dark:shadow-[0_14px_40px_-24px_rgba(2,6,23,0.98)]"
			>
				<AnimatePresence>
					{hovered ? (
						<motion.div
							initial={{ opacity: 0, y: 8, x: "-50%" }}
							animate={{ opacity: 1, y: 0, x: "-50%" }}
							exit={{ opacity: 0, y: 4, x: "-50%" }}
							className="absolute -top-11 left-1/2 rounded-full border border-white/70 bg-slate-950 px-3 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:border-white/10 dark:bg-slate-100 dark:text-slate-950"
						>
							{item.title}
						</motion.div>
					) : null}
				</AnimatePresence>

				<motion.div
					style={{ scale: iconScale }}
					className="flex items-center justify-center"
				>
					{item.icon}
				</motion.div>
			</motion.div>
		</DockLink>
	);
}
