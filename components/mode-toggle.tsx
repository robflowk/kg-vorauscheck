"use client";

import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted && resolvedTheme === "dark";

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			aria-label={
				isDark ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren"
			}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="relative rounded-full border-white/60 bg-white/80 text-slate-700 shadow-[0_12px_36px_-20px_rgba(15,23,42,0.45)] backdrop-blur-md hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/16"
		>
			<SunMedium className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
		</Button>
	);
}
