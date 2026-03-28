"use client";

import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export function SparklesCore({
	className,
	particleColor = "#f59e0b",
	background = "transparent",
	minSize = 0.6,
	maxSize = 1.8,
	speed = 1.4,
	particleDensity = 54,
}: {
	className?: string;
	particleColor?: string;
	background?: string;
	minSize?: number;
	maxSize?: number;
	speed?: number;
	particleDensity?: number;
}) {
	const [ready, setReady] = React.useState(false);
	const controls = useAnimation();
	const id = React.useId();

	React.useEffect(() => {
		initParticlesEngine(async (engine) => {
			await loadSlim(engine);
		}).then(() => {
			setReady(true);
		});
	}, []);

	const options = React.useMemo<ISourceOptions>(
		() => ({
			background: { color: { value: background } },
			fullScreen: { enable: false, zIndex: 0 },
			fpsLimit: 120,
			detectRetina: true,
			particles: {
				color: { value: particleColor },
				move: {
					enable: true,
					direction: "none",
					speed: { min: 0.15, max: speed },
					outModes: { default: "out" },
				},
				number: {
					value: particleDensity,
					density: { enable: true, width: 900, height: 320 },
				},
				opacity: {
					value: { min: 0.16, max: 0.9 },
					animation: {
						enable: true,
						speed: 0.9,
						startValue: "random",
						destroy: "none",
					},
				},
				size: {
					value: { min: minSize, max: maxSize },
				},
				shape: { type: "circle" },
				links: { enable: false },
			},
			interactivity: {
				events: {
					onHover: { enable: false, mode: "repulse" },
					resize: { enable: true },
				},
			},
		}),
		[background, maxSize, minSize, particleColor, particleDensity, speed],
	);

	return (
		<motion.div animate={controls} className={cn("opacity-0", className)}>
			{ready ? (
				<Particles
					id={id}
					className="h-full w-full"
					options={options}
					particlesLoaded={async () => {
						await controls.start({
							opacity: 1,
							transition: { duration: 0.9 },
						});
					}}
				/>
			) : null}
		</motion.div>
	);
}
