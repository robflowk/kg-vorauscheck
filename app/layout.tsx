import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const headingFont = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "KG-Vorauscheck",
	description:
		"Clientseitiger Rechner zur Prognose von Einkommensteuer, Soli und Vorauszahlungen für Mitunternehmer einer KG mit Einzel- oder gemeinsamer Veranlagung.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="de"
			className={`${headingFont.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
