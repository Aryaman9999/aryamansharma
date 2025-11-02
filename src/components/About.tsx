const About = () => {
  return (
    <section id="about" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl fade-in-up">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-shrink-0">
            <div className="w-64 h-80 bg-accent rounded-lg shadow-soft flex items-center justify-center text-muted-foreground">
              Casual Photo
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              I'm a Builder, Not Just an Engineer
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                My core "want" in life is autonomy, which I pursue through "asymmetric bets" and constant prototyping. 
                I believe the most interesting problems are at the intersection of different fields. My goal is to build 
                a career at the seam of intelligent software and physical hardware.
              </p>
              <p>
                This passion isn't new. It started in 9th grade, taking two buses to a government school's tinkering lab 
                just for the love of building. That "builder's" curiosity is the same force that drives me today, from my 
                Cvent internship to my IEEE project.
              </p>
              <p>
                As the Joint Chief (JCST) at PEC, I led all 13 of the college's technical societies. This role taught me 
                that the best technology is useless without a great team, clear communication, and a shared mission.
              </p>
              <p>
                When I'm not in front of a terminal or a soldering iron, you can find me at the gym, exploring new food 
                in Chandigarh, or in a deep philosophical discourse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
