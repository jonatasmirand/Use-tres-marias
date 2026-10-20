export default function BenefitsBar() {
  return (
    <div className="border-b border-[#e6e7e4] bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 sm:grid-cols-3">
        <div className="text-center py-[22px] px-[15px] border-b sm:border-b-0 sm:border-r border-[#e6e7e4] text-[12px] text-[#202522]">
          <strong className="block text-[13px] font-bold text-[#202522] mb-[5px]">
            Frete grátis
          </strong>
          <span className="text-[#5f6863]">Nas compras acima de R$ 299</span>
        </div>

        <div className="text-center py-[22px] px-[15px] border-b sm:border-b-0 sm:border-r border-[#e6e7e4] text-[12px] text-[#202522]">
          <strong className="block text-[13px] font-bold text-[#202522] mb-[5px]">
            Troca fácil
          </strong>
          <span className="text-[#5f6863]">Até 30 dias para trocar</span>
        </div>

        <div className="text-center py-[22px] px-[15px] text-[12px] text-[#202522]">
          <strong className="block text-[13px] font-bold text-[#202522] mb-[5px]">
            Compra segura
          </strong>
          <span className="text-[#5f6863]">Pagamento protegido</span>
        </div>
      </div>
    </div>
  );
}
