"use client";

import {
	motion,
	useAnimationFrame,
	useMotionTemplate,
	useMotionValue,
	useTransform,
} from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export function MovingBorder({
	children,
	duration = 3200,
	rx = "24%",
	ry = "24%",
}: {
	children: React.ReactNode;
	duration?: number;
	rx?: string;
	ry?: string;
}) {
	const pathRef = React.useRef<SVGRectElement>(null);
	const progress = useMotionValue(0);

	useAnimationFrame((time) => {
		const length = pathRef.current?.getTotalLength();

		if (!length) {
			return;
		}

		const velocity = length / duration;
		progress.set((time * velocity) % length);
	});

	const x = useTransform(
		progress,
		(value) => pathRef.current?.getPointAtLength(value).x,
	);
	const y = useTransform(
		progress,
		(value) => pathRef.current?.getPointAtLength(value).y,
	);
	const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="none"
				className="absolute inset-0 h-full w-full"
				aria-hidden="true"
				focusable="false"
			>
				<rect
					ref={pathRef}
					fill="none"
					width="100%"
					height="100%"
					rx={rx}
					ry={ry}
				/>
			</svg>

			<motion.div
				style={{
					top: 0,
					left: 0,
					transform,
					position: "absolute",
				}}
			>
				{children}
			</motion.div>
		</>
	);
}

export function MovingBorderCard({
	children,
	className,
	innerClassName,
	glowClassName,
	borderRadius = "2rem",
}: {
	children: React.ReactNode;
	className?: string;
	innerClassName?: string;
	glowClassName?: string;
	borderRadius?: string;
}) {
	return (
		<div
			className={cn(
				"relative overflow-hidden p-px shadow-[0_30px_120px_-40px_rgba(15,23,42,0.45)]",
				className,
			)}
			style={{ borderRadius }}
		>
			<div
				className="absolute inset-0"
				style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
			>
				<MovingBorder>
					<div
						className={cn(
							"h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.9)_0%,rgba(16,185,129,0.55)_38%,transparent_68%)] opacity-90",
							glowClassName,
						)}
					/>
				</MovingBorder>
			</div>

			<div
				className={cn(
					"relative h-full w-full border border-white/60 bg-[linear-gradient(180deg,rgba(12,18,28,0.96),rgba(15,23,42,0.92))] text-white backdrop-blur-xl",
					innerClassName,
				)}
				style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
			>
				{children}
			</div>
		</div>
	);
}
