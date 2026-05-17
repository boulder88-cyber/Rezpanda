import React from 'react';

const properties = [
  {
    title: 'Single Family Homes',
    description: 'A smarter way to run your home. Our platform brings every task, document, bill, and system into one elegant dashboard—so homeowners stay organized, proactive, and in control. From maintenance to utilities to records, it simplifies the chaos of homeownership into a calm, seamless, beautifully managed experience.',
    image: 'https://images.unsplash.com/photo-1647579350413-a6ada4e480ed?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Multifamily Assets',
    description: 'Purpose‑built for multifamily property managers. Our platform centralizes building operations, maintenance workflows, documentation, and team coordination—delivering clarity, accountability, and seamless oversight across every unit and asset. It turns complex portfolios into efficient, well‑run communities with consistent standards and total operational control',
    image: 'https://images.unsplash.com/photo-1604431359677-e14be23a50d3?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Vacation Rentals',
    description: 'Designed for investors who treat every property like a business. Our platform centralizes tasks, documents, expenses, and communication into one elegant dashboard—giving you clarity, efficiency, and total oversight. From maintenance to payments to records, it transforms scattered rentals into a streamlined, well‑run portfolio that practically manages itself',
    image: 'https://images.unsplash.com/photo-1593321706583-6a76bdbee0f1?auto=format&fit=crop&w=800&q=80'
  }
];

const PropertyShowcase = () => {
  return (
    <section className="py-20 bg-background relative z-20 -mt-12 rounded-t-[3rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Manage Any Property Type
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you own a single residence or a diverse real estate portfolio, our platform adapts to your specific property management needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties.map((prop, idx) => (
            <div 
              key={idx} 
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-[400px] cursor-pointer border border-border/50"
            >
              {/* Background Image */}
              <img 
                src={prop.image} 
                alt={prop.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                loading="lazy"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-md">
                    {prop.title}
                  </h3>
                  <div className="overflow-hidden">
                    <p className="text-slate-200 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                      {prop.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;