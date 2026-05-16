import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: "#FD7D0E",
};

export const metadata: Metadata = {
  title: "Naali Creative Studio",
  description:
    "Naali's internal AI studio — brand intel, scripts, video briefs, static ads, and video generation built around the relief-brand voice.",
  openGraph: {
    title: "Naali Creative Studio",
    description:
      "Naali's internal AI studio — brand intel, scripts, video briefs, static ads, and video generation built around the relief-brand voice.",
    images: ["/naali-logo.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
