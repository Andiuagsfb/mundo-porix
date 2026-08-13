import Catalog from "@/components/Catalog";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Promo from "@/components/Promo";
import QuoteDrawer from "@/components/QuoteDrawer";
import Season from "@/components/Season";
import Toast from "@/components/Toast";
import TopBar from "@/components/TopBar";
import { StoreProvider } from "@/context/store-context";

export default function Home() {
  return (
    <StoreProvider>
      <TopBar />
      <Header />
      <main id="inicio">
        <Hero />
        <Catalog />
        <Promo />
        <Season />
      </main>
      <Footer />
      <QuoteDrawer />
      <Toast />
    </StoreProvider>
  );
}
