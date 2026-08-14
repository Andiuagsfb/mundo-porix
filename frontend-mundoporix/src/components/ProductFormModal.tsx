"use client";

import { useMemo, useState, type FormEvent } from "react";
import Modal from "./Modal";
import { api, ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { Brand, Category, Product } from "@/lib/types";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onSaved: () => void;
}

const inputClass =
  "w-full rounded-[12px] border border-line bg-bg px-[14px] py-[11px] text-[0.82rem] text-[#3D332D] outline-none transition-colors placeholder:text-[#A99A8C] focus:border-primary";

const labelClass = "mb-[7px] block text-[0.72rem] font-extrabold text-dark";

export default function ProductFormModal({
  open,
  onClose,
  product,
  categories,
  brands,
  onSaved,
}: ProductFormModalProps) {
  const isEdit = product !== null;

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [initialStock, setInitialStock] = useState("");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      price !== "" &&
      !Number.isNaN(Number(price)) &&
      Number(price) >= 0 &&
      categoryId !== "" &&
      brandId !== "" &&
      !submitting,
    [name, price, categoryId, brandId, submitting],
  );

  const close = () => {
    onClose();
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const body = {
      name: name.trim(),
      price: Number(price),
      categoryId,
      brandId,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
      isActive,
    };

    try {
      if (isEdit && product) {
        await api.patch(`/admin/products/${product.id}`, body);
      } else {
        await api.post("/admin/products", {
          ...body,
          initialStock:
            initialStock === "" ? undefined : Number(initialStock),
        });
      }
      onSaved();
      close();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar el producto. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const priceValue = Number(price);

  return (
    <Modal
      open={open}
      onClose={close}
      labelledBy="product-form-title"
      maxWidth="max-w-[560px]"
    >
      <div className="mb-[20px]">
        <span className="eyebrow">{isEdit ? "Editar producto" : "Nuevo producto"}</span>
        <h2
          id="product-form-title"
          className="mt-[6px] font-display text-[2rem] text-dark"
        >
          {isEdit ? "Editar producto" : "Agregar producto"}
        </h2>
        <p className="mt-[8px] text-[0.78rem] text-muted">
          {isEdit
            ? "Actualiza los datos y guarda los cambios."
            : "Completa los datos para publicar el producto en el catálogo."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[13px]">
        <label className="block">
          <span className={labelClass}>Nombre del producto *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Cuaderno universitario 100 hojas"
            className={inputClass}
          />
        </label>

        <div className="grid gap-[13px] sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Precio (COP) *</span>
            <input
              required
              type="number"
              min={0}
              step={100}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
            {priceValue >= 0 && price !== "" && (
              <span className="mt-[6px] block text-[0.68rem] text-muted">
                {money(priceValue)}
              </span>
            )}
          </label>
          <label className="block">
            <span className={labelClass}>Categoría *</span>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Marca *</span>
            <select
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          {!isEdit && (
            <label className="block">
              <span className={labelClass}>Stock inicial</span>
              <input
                type="number"
                min={0}
                step={1}
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </label>
          )}
        </div>

        <div>
          <span className={labelClass}>Imagen (URL)</span>
          <div className="flex items-center gap-[12px]">
            <div
              className="grid h-[64px] w-[64px] shrink-0 place-items-center overflow-hidden rounded-[12px] border border-line bg-surface2 text-[1.2rem] text-dark"
              style={{ background: imageUrl ? undefined : "#E9DDCF" }}
            >
              {imageUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl.trim()}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display">{name.trim()[0] || "?"}</span>
              )}
            </div>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className={inputClass}
            />
          </div>
          <p className="mt-[7px] text-[0.66rem] text-muted">
            Pega la dirección (URL) de la imagen del producto. Si la dejas
            vacía, se mostrará la ilustración del catálogo.
          </p>
        </div>

        <label className="block">
          <span className={labelClass}>Descripción (opcional)</span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles del producto…"
            className={`${inputClass} resize-none`}
          />
        </label>

        {isEdit && (
          <label className="flex cursor-pointer items-center gap-2 text-[0.76rem] font-bold text-muted">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-dark"
            />
            Producto activo (visible en el catálogo)
          </label>
        )}

        {error && (
          <p className="rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
            {error}
          </p>
        )}

        <div className="mt-[2px] flex gap-[10px]">
          <button type="button" onClick={close} className="btn btn-light flex-1">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : isEdit ? (
              "Guardar cambios →"
            ) : (
              "Crear producto →"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
