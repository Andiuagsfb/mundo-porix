export default function Season() {
  return (
    <section id="temporada" className="pb-[60px] sm:pb-[82px]">
      <div className="container grid gap-[18px] sm:grid-cols-2">
        <div className="min-h-[230px] rounded-[20px] bg-[#E8D8C8] p-6 sm:rounded-[22px] sm:p-[35px]">
          <span className="eyebrow">01 · Busca</span>
          <h2 className="my-[14px] font-display text-[clamp(2.3rem,7vw,3rem)] text-dark">
            Encuentra rápido.
          </h2>
          <p className="max-w-[430px] text-[0.95rem] text-[#79695C]">
            Usa categorías, búsqueda y precio para llegar a lo que realmente
            necesitas.
          </p>
        </div>
        <div className="min-h-[230px] rounded-[20px] bg-[#DDE4DA] p-6 sm:rounded-[22px] sm:p-[35px]">
          <span className="eyebrow" style={{ color: "#67755F" }}>
            02 · Cotiza
          </span>
          <h2 className="my-[14px] font-display text-[clamp(2.3rem,7vw,3rem)] text-dark">
            Arma tu pedido.
          </h2>
          <p className="max-w-[430px] text-[0.95rem] text-[#79695C]">
            Agrega productos, revisa tu total estimado y continúa con los datos
            para la cotización.
          </p>
        </div>
      </div>
    </section>
  );
}
