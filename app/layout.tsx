import "./globals.css";

export const metadata = {
  title: "GENECT Buddy | Connecting Generations",
  description: "A bilingual companion platform connecting older adults, families, and trained GENECT buddies."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
