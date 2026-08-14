"use client";

import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { useAuth } from "@/context/auth-context";

const inputClass =
  "w-full rounded-[12px] border border-line bg-bg px-[14px] py-[11px] text-[0.82rem] text-[#3D332D] outline-none transition-colors placeholder:text-[#A99A8C] focus:border-primary";

export default function LoginModal() {
  const { loginOpen, closeLogin, login, loginError, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await login(email, password);
      setEmail("");
      setPassword("");
    } catch {
      /* error ya queda en loginError */
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    closeLogin();
    setEmail("");
    setPassword("");
  };

  return (
    <Modal open={loginOpen} onClose={close} labelledBy="login-title">
      <div className="mb-[22px]">
        <span className="eyebrow">Acceso</span>
        <h2
          id="login-title"
          className="mt-[6px] font-display text-[2.1rem] text-dark"
        >
          Inicia sesión
        </h2>
        <p className="mt-[8px] text-[0.78rem] text-muted">
          Ingresa con tu cuenta para gestionar el panel de la tienda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[13px]">
        <label className="block">
          <span className="mb-[7px] block text-[0.72rem] font-extrabold text-dark">
            Correo electrónico
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-[7px] block text-[0.72rem] font-extrabold text-dark">
            Contraseña
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </label>

        {loginError && (
          <p className="rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
            {loginError}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn btn-primary mt-[6px] w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : status === "loading" ? (
            "Verificando sesión…"
          ) : (
            "Entrar →"
          )}
        </button>
      </form>

      <div className="mt-[18px] rounded-[12px] border border-line bg-bg px-[14px] py-[11px] text-[0.68rem] text-muted">
        Usuario de prueba: <b className="text-dark">admin@mundoporix.com</b> ·
        contraseña <b className="text-dark">Admin123!</b>
      </div>
    </Modal>
  );
}
