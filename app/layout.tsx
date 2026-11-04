import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/Topbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Conveniência — Pedidos Online",
  description: "Tudo o que você precisa, em um só lugar. Delivery e conveniência.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-white text-black antialiased">
        <FavoritesProvider>
          <CartProvider>
            <Topbar />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
