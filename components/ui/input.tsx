import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-12 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-base text-slate-950 shadow-[0_12px_40px_-22px_rgba(15,23,42,0.35)] outline-none backdrop-blur-sm transition-[border,box-shadow,background,color] placeholder:text-slate-500 focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-white dark:placeholder:text-slate-400 dark:focus-visible:border-amber-300 dark:focus-visible:bg-white/12 dark:focus-visible:ring-amber-300/20",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
