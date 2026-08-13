import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Mundo Pórix | Librería & Papelería",
  description:
    "Catálogo de librería con la comodidad de un e-commerce: busca, filtra, compara precios y arma tu cotización en pocos pasos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} ${dmSerif.variable}`}>
      <body className="min-h-full bg-bg text-[#3D332D] antialiased">
        {children}
      </body>
    </html>
  );
}
