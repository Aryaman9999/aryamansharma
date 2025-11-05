// src/components/LinkedInBadge.tsx
import { useEffect } from 'react';

const LinkedInBadge = () => {
  // This is the HTML part (the <div>) that LinkedIn gave you
  const badgeHtml = `
    <div class="badge-base LI-profile-badge" data-locale="en_US" data-size="large" data-theme="light" data-type="HORIZONTAL" data-vanity="aryaman9" data-version="v1">
      <a class="badge-base__link LI-simple-link" href="https://in.linkedin.com/in/aryaman9?trk=profile-badge">
        Aryaman Sharma
      </a>
    </div>
  `;

  // This hook loads the external script (the <script>)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://platform.linkedin.com/badges/js/profile.js";
    script.async = true;
    script.defer = true;
    script.type = "text/javascript";
    
    // Add the script to the body
    document.body.appendChild(script);

    // This cleanup function will remove the script when the component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []); // The empty array [] means this effect runs only once

  return (
    <section id="linkedin" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-4xl text-center fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
          Find Me on LinkedIn
        </h2>
        
        {/* This div will render the HTML from badgeHtml */}
        <div 
          className="flex justify-center"
          dangerouslySetInnerHTML={{ __html: badgeHtml }} 
        />
      </div>
    </section>
  );
};

export default LinkedInBadge;