import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#18221e] text-[#dce3df] px-6 pt-[55px] pb-[25px]">
      <div className="mx-auto max-w-[1240px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-[45px]">
        {/* Coluna 1: Marca & Missão */}
        <div>
          <h3 className="font-serif text-[27px] font-normal text-white mb-[14px]">
            useTrêsMarias
          </h3>
          <p className="text-[12px] leading-[1.8] text-[#aeb9b3] max-w-sm">
            Moda feminina para mulheres que gostam de se vestir de si mesmas. Peças pensadas para acompanhar todos os seus momentos.
          </p>
        </div>

        {/* Coluna 2: Atendimento */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white mb-[14px]">
            Atendimento
          </h4>
          <div className="space-y-1">
            <Link href="/contato" className="block text-[12px] leading-[1.8] text-[#aeb9b3] hover:text-white transition">
              Fale conosco
            </Link>
            <Link href="/contato" className="block text-[12px] leading-[1.8] text-[#aeb9b3] hover:text-white transition">
              Trocas e devoluções
            </Link>
          </div>
        </div>

        {/* Coluna 3: Institucional */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white mb-[14px]">
            Institucional
          </h4>
          <div className="space-y-1">
            <Link href="/sobre" className="block text-[12px] leading-[1.8] text-[#aeb9b3] hover:text-white transition">
              Sobre nós
            </Link> 
          </div>
        </div>

        {/* Coluna 4: Redes Sociais */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white mb-[14px]">
            Redes sociais
          </h4>
          <div className="space-y-1">
            <a href="https://instagram.com/usetresmarias" target="_blank" rel="noopener noreferrer" className="block text-[12px] leading-[1.8] text-[#aeb9b3] hover:text-white transition">
              Instagram (@usetresmarias)
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="block text-[12px] leading-[1.8] text-[#aeb9b3] hover:text-white transition">
              TikTok
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="block text-[12px] leading-[1.8] text-[#aeb9b3] hover:text-white transition">
              Pinterest
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto max-w-[1240px] mt-[45px] pt-5 border-t border-[#33403a] text-[11px] text-[#7f8d85]">
        © 2026 useTrêsMarias. Todos os direitos reservados.
      </div>
    </footer>
  );
}
