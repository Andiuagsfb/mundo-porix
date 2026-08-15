export default function Hero() {
  return (
    <section className="pb-7 pt-[26px]">
      <div className="container grid gap-[18px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[350px] overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#E9D8C5,#DCC5AD)] p-7 sm:rounded-[25px] sm:p-10 lg:p-12">
          <span className="pointer-events-none absolute -bottom-40 -right-[140px] h-[360px] w-[360px] rounded-full border border-dark/10" />
          <span className="eyebrow">Nueva colección · 2026</span>
          <h1 className="mt-[15px] max-w-[720px] font-display text-[clamp(3.2rem,6vw,5.6rem)] text-dark">
            Compra bonito. Elige mejor.
          </h1>
          <p className="mb-[22px] mt-4 max-w-[620px] text-[0.95rem] text-[#705E4E]">
            Un catálogo de librería con la comodidad de un e-commerce: busca,
            filtra, compara precios y arma tu cotización en pocos pasos.
          </p>
          <div className="flex flex-wrap gap-[9px]">
            <a href="#catalogo" className="btn btn-primary">
              Comprar por categorías →
            </a>
            <a href="#destacados" className="btn btn-light">
              Ver destacados
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-[18px] min-[761px]:grid-cols-2 lg:grid-cols-1">
          <div className="relative overflow-hidden rounded-[20px] bg-[#DCE4D7] p-[27px]">
            <span className="pointer-events-none absolute -right-[45px] -top-10 h-[150px] w-[150px] rounded-full border border-dark/10" />
            <span className="eyebrow">Regreso a clases</span>
            <h3 className="mb-2 mt-[10px] max-w-[280px] font-display text-[2rem] font-normal text-dark">
              Todo listo para empezar.
            </h3>
            <p className="max-w-[250px] text-[0.75rem] text-[#6E665C]">
              Cuadernos, escritura, color y organización en una sola colección.
            </p>
            <a href="#catalogo" className="mt-[15px] inline-block text-[0.74rem] font-extrabold text-dark">
              Explorar ahora ↗
            </a>
          </div>
          <div className="relative overflow-hidden rounded-[20px] bg-[#E8D7D1] p-[27px]">
            <span className="pointer-events-none absolute -right-[45px] -top-10 h-[150px] w-[150px] rounded-full border border-dark/10" />
            <span className="eyebrow">Hasta tu presupuesto</span>
            <h3 className="mb-2 mt-[10px] max-w-[280px] font-display text-[2rem] font-normal text-dark">
              Encuentra opciones sin excederte.
            </h3>
            <p className="max-w-[250px] text-[0.75rem] text-[#6E665C]">
              Usa el filtro de precio para llegar a los productos que sí encajan.
            </p>
            <a href="#catalogo" className="mt-[15px] inline-block text-[0.74rem] font-extrabold text-dark">
              Ver productos ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
