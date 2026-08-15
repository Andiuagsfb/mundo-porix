export default function Promo() {
  return (
    <section id="destacados" className="py-[52px] sm:py-[72px]">
      <div className="container grid gap-[15px] lg:grid-cols-[1.3fr_0.7fr]">
        <div className="min-h-[275px] rounded-[20px] bg-[#6A4B38] p-7 text-white sm:rounded-[23px] sm:p-[38px]">
          <span className="eyebrow" style={{ color: "#E7D5C4" }}>
            Selección de temporada
          </span>
          <h2 className="my-3 max-w-[650px] font-display text-[clamp(2.2rem,7vw,3.6rem)] text-white">
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
        <div className="flex flex-col justify-between rounded-[20px] bg-[#E3E8DF] p-6 sm:rounded-[23px] sm:p-[30px]">
          <div>
            <span className="eyebrow" style={{ color: "#65705E" }}>
              Comprar mejor
            </span>
            <h3 className="mt-3 font-display text-[clamp(1.7rem,5vw,2.1rem)] font-normal text-dark">
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
