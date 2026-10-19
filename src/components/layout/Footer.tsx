import Link from "next/link";

const navigationLinks = [
  { label: "Novidades", href: "/#novidades" },
  { label: "Vestidos", href: "/#vestidos" },
  { label: "Blusas", href: "/#blusas" },
  { label: "Bermudas", href: "/#bermudas" },
  { label: "Conjuntos", href: "/#conjuntos" },
];

export default function Footer() {
  return (
    <footer className="bg-[#18221e] px-6 pt-12 pb-6 text-[#dce3df] sm:pt-14">
      <div className="mx-auto grid max-w-[1240px] gap-9 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:gap-[45px]">
        <div>
          <Link
            aria-label="Use Três Marias - página inicial"
            className="inline-block font-serif text-[27px] text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9cbbb]"
            href="/"
          >
            useTrêsMarias
          </Link>
          <p className="mt-3 max-w-sm text-xs leading-[1.8] text-[#aeb9b3]">
            E-commerce Use Três Marias.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
            Navegue
          </h2>
          <ul className="space-y-1">
            {navigationLinks.map((link) => (
              <li key={link.label}>
                <Link
                  className="text-xs leading-[1.8] text-[#aeb9b3] transition hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9cbbb]"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
            Use Três Marias
          </h2>
          <p className="text-xs leading-[1.8] text-[#aeb9b3]">
            Informações de atendimento e canais oficiais serão adicionados
            futuramente.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1240px] border-t border-[#33403a] pt-5 text-[11px] text-[#7f8d85]">
        © Use Três Marias. Todos os direitos reservados.
      </div>
    </footer>
  );
}
