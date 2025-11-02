const SocialProof = () => {
  const companies = [
    { name: "Cadence", logo: "Cadence" },
    { name: "Cvent", logo: "Cvent" },
    { name: "IEEE", logo: "IEEE" },
    { name: "PEC", logo: "PEC" },
    { name: "Hitachi", logo: "Hitachi" },
  ];

  return (
    <section className="py-16 px-6 border-t border-border fade-in">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((company) => (
            <div
              key={company.name}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl font-semibold"
            >
              {company.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
