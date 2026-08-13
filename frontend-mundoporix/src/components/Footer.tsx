export default function Footer() {
  const footerLink =
    "my-[7px] block text-[0.76rem] text-muted";

  return (
    <footer className="border-t border-line pb-7 pt-[50px]">
      <div className="container">
        <div className="grid gap-[35px] border-b border-line pb-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#inicio" className="flex items-center gap-[10px] font-extrabold text-dark">
              <span className="grid h-10 w-10 -rotate-[4deg] place-items-center rounded-xl bg-dark font-display text-[1.2rem] text-white">
                C
              </span>
              <span>Casa Papel</span>
            </a>
            <p className="mt-[14px] max-w-[300px] text-[0.76rem] text-muted">
              Una librería pensada como tienda: fácil de explorar, agradable de
              mirar y rápida para cotizar.
            </p>
          </div>
          <div>
            <h4 className="mb-[14px] text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-primary">
              Tienda
            </h4>
            <a href="#catalogo" className={footerLink}>Todos los productos</a>
            <a href="#categorias" className={footerLink}>Categorías</a>
            <a href="#destacados" className={footerLink}>Destacados</a>
          </div>
          <div>
            <h4 className="mb-[14px] text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-primary">
              Ayuda
            </h4>
            <a href="#" className={footerLink}>Preguntas frecuentes</a>
            <a href="#" className={footerLink}>Cómo cotizar</a>
            <a href="#" className={footerLink}>Contacto</a>
          </div>
          <div>
            <h4 className="mb-[14px] text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-primary">
              Horarios
            </h4>
            <p className="my-[7px] text-[0.76rem] text-muted">Lun — Sáb</p>
            <p className="my-[7px] text-[0.76rem] text-muted">8:00 — 18:00</p>
            <p className="my-[7px] text-[0.76rem] text-muted">Colombia</p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-[7px] pt-[19px] text-[0.67rem] text-[#8B7B6E] sm:flex-row">
          <span>© 2026 Casa Papel · Demo front-end</span>
          <span>Editorial e-commerce · Café pastel</span>
        </div>
      </div>
    </footer>
  );
}
