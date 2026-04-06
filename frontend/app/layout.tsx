import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";
import { Inter, Manrope } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

const manrope = Manrope({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-manrope',
});

export const metadata: Metadata = {
    title: "Activity Monitor | Productivity Intelligence",
    description: "Understand your productivity patterns with ML-powered insights. Upload activity logs for AI coaching, focus mapping, and burnout prevention.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`light ${inter.variable} ${manrope.variable}`}>
            <head>
                {/* Material Symbols — loaded async to avoid render-blocking */}
                <link
                    rel="preload"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    as="style"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                    media="print"
                    // @ts-ignore — onLoad to switch media for non-blocking load
                    onLoad="this.media='all'"
                />
            </head>
            <body className={`${inter.className} bg-[#f0f2f5] text-[#1a1d21] antialiased selection:bg-[#4f46e5]/15`}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <AppShell>
                        {children}
                    </AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
