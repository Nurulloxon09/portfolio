export function Section({
  id,
  number,
  title,
  strongRule = false,
  children,
}: {
  id: string;
  number: string;
  title: string;
  strongRule?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="section-band scroll-mt-4"
      style={strongRule ? { borderTopColor: "var(--color-rule-strong)" } : undefined}
    >
      <div className="container-x py-[26px] lg:py-14">
        <div className="mb-3 flex items-baseline gap-2.5 lg:mb-6">
          <span className="font-heading tnum text-[15px] text-(--color-accent)">{number}</span>
          <h2 className="m-0 text-[28px] lg:text-[40px]">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
