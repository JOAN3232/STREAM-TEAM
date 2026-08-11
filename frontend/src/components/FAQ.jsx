import { useState } from "react";

const faqs = [
  {
    question: "What is STREAM?",
    answer:
      "STREAM is an entertainment platform where you can discover and enjoy movies, series, documentaries, and more across your favourite devices.",
  },
  {
    question: "How much does STREAM cost?",
    answer:
      "STREAM offers flexible membership plans designed for different viewing needs. There are no complicated commitments, and you can change your plan when needed.",
  },
  {
    question: "Where can I watch?",
    answer:
      "Watch STREAM on your phone, tablet, laptop, smart TV, and other supported streaming devices.",
  },
  {
    question: "How do I cancel?",
    answer:
      "You can manage or cancel your membership directly from your account settings without complicated cancellation steps.",
  },
  {
    question: "What can I watch on STREAM?",
    answer:
      "STREAM gives you access to movies, series, documentaries, family entertainment, and an expanding collection of stories from around the world.",
  },
  {
    question: "Is STREAM good for kids?",
    answer:
      "Yes. Dedicated profiles can provide a more suitable viewing experience for younger members of the family.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative overflow-hidden bg-[#050505] px-5 py-20 md:px-10 lg:px-14">
      {/* background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-[1100px]">
        {/* heading */}
        <div className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-violet-400">
            Need to know
          </p>

          <h2
            className="text-3xl text-white md:text-4xl lg:text-5xl"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        {/* questions */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={faq.question}
                className={`
                  overflow-hidden
                  border
                  transition-all
                  duration-300
                  ${
                    isOpen
                      ? "border-violet-500/40 bg-[#15101f]"
                      : "border-white/[0.08] bg-[#0d0b11] hover:border-violet-500/25"
                  }
                `}
                style={{
                  borderRadius: "18px 4px 18px 4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-6
                    px-6
                    py-6
                    text-left
                    md:px-8
                  "
                >
                  <div className="flex items-center gap-5">
                    <span className="hidden text-xs tracking-[0.2em] text-white/25 sm:block">
                      0{index + 1}
                    </span>

                    <span
                      className="text-xl text-white md:text-2xl"
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                      }}
                    >
                      {faq.question}
                    </span>
                  </div>

                  {/* custom + icon */}
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10">
                    <span className="absolute h-[1.5px] w-4 bg-violet-300" />

                    <span
                      className={`
                        absolute
                        h-4
                        w-[1.5px]
                        bg-violet-300
                        transition-transform
                        duration-300
                        ${isOpen ? "rotate-90 opacity-0" : "rotate-0"}
                      `}
                    />
                  </span>
                </button>

                <div
                  className={`
                    grid
                    transition-all
                    duration-500
                    ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[850px] px-6 pb-7 text-sm leading-7 text-white/55 sm:pl-[74px] md:px-8 md:pl-[82px]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}