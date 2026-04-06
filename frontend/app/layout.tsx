import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
    title: "Ethereal Analytics | Productivity Intelligence",
    description: "Understand your productivity patterns with ML-powered insights. Upload activity logs for AI coaching, focus mapping, and burnout prevention.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className="light">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-[#f5f7f9] text-[#2c2f31] antialiased selection:bg-[#2444eb]/20" style={{fontFamily: "'Inter', sans-serif"}}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <AppShell>
                        {children}
                    </AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
