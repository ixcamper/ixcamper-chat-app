import type { Metadata } from "next";
import { Inter } from "next/font/google";
// CRITICAL FIX: This line injects Tailwind styles into all sub-pages!
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Private Chat Engine",
	description: "Real-time 1x1 messaging interface",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
