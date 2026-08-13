export default function Promo() {
  return (
    <section id="destacados" className="py-[72px]">
      <div className="container grid gap-[15px] lg:grid-cols-[1.3fr_0.7fr]">
        <div className="min-h-[275px] rounded-[23px] bg-[#6A4B38] p-[38px] text-white">
          <span className="eyebrow" style={{ color: "#E7D5C4" }}>
            Selección de temporada
          </span>
          <h2 className="my-3 max-w-[650px] font-display text-[2.9rem] text-white sm:text-[3.6rem]">
            Prepara tu lista sin abrir diez pestañas.
          </h2>
          <p className="max-w-[480px] text-[0.8rem] text-[#EADDCF]">
            La experiencia combina descubrimiento visual con herramientas de
            e-commerce para que encontrar y cotizar sea realmente rápido.
          </p>
          <a href="#catalogo" className="btn btn-light mt-5">
            Explorar colección →
          </a>
        </div>
        <div className="flex flex-col justify-between rounded-[23px] bg-[#E3E8DF] p-[30px]">
          <div>
            <span className="eyebrow" style={{ color: "#65705E" }}>
              Comprar mejor
            </span>
            <h3 className="mt-3 font-display text-[2.1rem] font-normal text-dark">
              Una selección para cada presupuesto.
            </h3>
          </div>
          <div>
            <div className="flex justify-between border-t border-dark/10 py-[10px] text-[0.72rem]">
              <span>Esencial</span>
              <b className="text-dark">desde $1.500</b>
            </div>
            <div className="flex justify-between border-t border-dark/10 py-[10px] text-[0.72rem]">
              <span>Estudio</span>
              <b className="text-dark">desde $6.500</b>
            </div>
            <div className="flex justify-between border-t border-dark/10 py-[10px] text-[0.72rem]">
              <span>Premium</span>
              <b className="text-dark">desde $18.500</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
