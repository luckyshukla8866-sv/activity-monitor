import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
    title: "Activity Monitor",
    description: "Upload and analyze your desktop activity with ML-powered insights",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased selection:bg-indigo-500/30">
                <ThemeProvider attribute="class" defaultTheme="dark">
                    <AppShell>
                        {children}
                    </AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
