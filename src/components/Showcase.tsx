import { useState } from "react";
import { BASE_RATE } from "@/components/ExchangeWidget";
import { OrderCard } from "@/components/fragments/Panels";
import { useContent } from "@/i18n";

/**
 * «Input half, output half»: слева на тёмном поле то, что вводит клиент на
 * сайте (сумма и кошелёк, редактируемые), справа на светлом — карточка той же
 * заявки у оператора. Заголовок разрезан по шву: начало внизу слева, конец внизу справа.
 */
const Showcase = () => {
  const { SHOWCASE } = useContent();
  const [amount, setAmount] = useState("25 000");
  const [wallet, setWallet] = useState("TVd7xk3nF2pLq9mWz8rY4sHb6cJd9kQz");
  const num = Number(amount.replace(/[^\d]/g, "")) || 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2" aria-labelledby="showcase-title">
      <h2 id="showcase-title" className="sr-only">{SHOWCASE.left} {SHOWCASE.right}</h2>

      <div className="bg-ink relative flex min-h-[62svh] flex-col justify-between px-6 pb-8 pt-16 sm:px-10 lg:min-h-[90svh] lg:px-[8%] lg:pt-[28svh]">
        <div className="max-w-[34ch]">
          <p className="t-small font-medium opacity-70">{SHOWCASE.inputTitle}</p>
          <label className="mt-6 block">
            <span className="t-small opacity-70">{SHOWCASE.amountLabel}</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              className="t-lead mt-1 block w-full border-0 border-b-2 border-current bg-transparent pb-1 font-semibold outline-none focus-visible:outline-none"
            />
          </label>
          <label className="mt-6 block">
            <span className="t-small opacity-70">{SHOWCASE.walletLabel}</span>
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              spellCheck={false}
              className="t-body mt-1 block w-full border-0 border-b-2 border-current bg-transparent pb-1 font-medium outline-none focus-visible:outline-none"
            />
          </label>
          <p className="t-small mt-6 opacity-70">{SHOWCASE.hint}</p>
        </div>
        <p className="t-display mt-12 font-bold" aria-hidden="true">{SHOWCASE.left}</p>
      </div>

      <div className="bg-surface relative flex min-h-[62svh] flex-col justify-between px-6 pb-8 pt-10 sm:px-10 lg:min-h-[90svh] lg:px-[8%] lg:pt-[28svh]">
        <div className="flex justify-start lg:justify-center">
          <OrderCard amount={num} wallet={wallet} rate={BASE_RATE} />
        </div>
        <p className="t-display mt-12 text-right font-bold" aria-hidden="true">{SHOWCASE.right}</p>
      </div>
    </section>
  );
};

export default Showcase;
