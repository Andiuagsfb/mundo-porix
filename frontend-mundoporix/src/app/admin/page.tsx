"use client";

import AdminPanel from "@/components/AdminPanel";
import ContactModal from "@/components/ContactModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import Toast from "@/components/Toast";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/context/auth-context";
import { AuthProvider } from "@/context/auth-context";
import { StoreProvider } from "@/context/store-context";

function AdminGate() {
  const { user, status, openLogin } = useAuth();

  if (status === "loading") {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <span className="h-[28px] w-[28px] animate-spin rounded-full border-2 border-[#E5D9CA] border-t-dark" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[460px] px-5 py-24 text-center">
        <span className="eyebrow">Área restringida</span>
        <h1 className="mt-[8px] font-display text-[2.2rem] text-dark">
          Inicia sesión para gestionar la tienda
        </h1>
        <p className="mt-[10px] text-[0.82rem] text-muted">
          Solo administradores y vendedores pueden acceder a este panel.
        </p>
        <button
          onClick={openLogin}
          className="btn btn-primary mt-[22px]"
        >
          Iniciar sesión →
        </button>
      </div>
    );
  }

  if (user.roleName !== "ADMIN" && user.roleName !== "SELLER") {
    return (
      <div className="mx-auto max-w-[460px] px-5 py-24 text-center">
        <span className="eyebrow">Acceso denegado</span>
        <h1 className="mt-[8px] font-display text-[2.2rem] text-dark">
          No tienes permisos
        </h1>
        <p className="mt-[10px] text-[0.82rem] text-muted">
          Tu cuenta no tiene permisos para gestionar la tienda.
        </p>
      </div>
    );
  }

  return <AdminPanel />;
}

export default function AdminPage() {
  return (
    <StoreProvider>
      <AuthProvider>
        <TopBar />
        <Header />
        <main>
          <AdminGate />
        </main>
        <Footer />
        <LoginModal />
        <ContactModal />
        <Toast />
      </AuthProvider>
    </StoreProvider>
  );
}
