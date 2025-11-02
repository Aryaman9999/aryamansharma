import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Github } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-3xl text-center fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Let's Build Together
        </h2>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          I'm always open to discussing new ideas, challenging projects, or asymmetric opportunities. 
          Whether you're a founder, a recruiter, or just a curious mind, let's talk.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2">
            <Mail className="w-4 h-4" />
            Send me an Email
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Linkedin className="w-4 h-4" />
            Connect on LinkedIn
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Github className="w-4 h-4" />
            See My Code on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
