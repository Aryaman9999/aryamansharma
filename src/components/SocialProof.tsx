import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SocialProof = () => {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("display_order");
    if (data) setCompanies(data);
  };

  return (
    <section className="py-16 px-6 border-t border-border fade-in">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((company) => (
            <div
              key={company.id}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl font-semibold"
            >
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="h-8 object-contain" />
              ) : (
                company.name
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
