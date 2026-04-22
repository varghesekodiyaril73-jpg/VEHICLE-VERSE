import React from 'react';
import { CarCard } from './CarCard';

export const CarShowcase: React.FC = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-4xl font-display font-bold text-white mb-2">THE COLLECTION</h2>
            <p className="text-white/40 font-light tracking-wide">SELECT YOUR MACHINE TO CONFIGURE</p>
          </div>
          <div className="hidden md:flex gap-4 text-xs font-bold text-white/30">
            <span>01 // HYPER</span>
            <span>02 // SPORT</span>
            <span>03 // LUXURY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* LaFerrari - Red Border */}
          <CarCard
            name="LA FERRARI"
            year="2015"
            category="HYPERCAR"
            accentColor="border-neon-red"
            glowColor="shadow-[0_0_30px_rgba(255,0,51,0.15)]"
            hoverGlow="group-hover:shadow-[0_0_50px_rgba(255,0,51,0.4)]"
            textColor="text-neon-red"
            imageUrl="https://picsum.photos/800/600?random=1"
            stats={[
              { label: '0-60', value: '2.4s' },
              { label: 'HP', value: '949' },
              { label: 'TOP', value: '217 MPH' }
            ]}
          />

          {/* Porsche - Blue Border */}
          <CarCard
            name="911 GT3 RS"
            year="2023"
            category="TRACK WEAPON"
            accentColor="border-neon-blue"
            glowColor="shadow-[0_0_30px_rgba(0,243,255,0.15)]"
            hoverGlow="group-hover:shadow-[0_0_50px_rgba(0,243,255,0.4)]"
            textColor="text-neon-blue"
            imageUrl="https://picsum.photos/800/600?random=2"
            stats={[
              { label: '0-60', value: '3.0s' },
              { label: 'HP', value: '518' },
              { label: 'TOP', value: '184 MPH' }
            ]}
          />

          {/* BMW M5 2019 - Amber Border (Distinct from others) */}
          <CarCard
            name="BMW M5 COMPETITION"
            year="2019"
            category="SUPER SEDAN"
            accentColor="border-neon-amber"
            glowColor="shadow-[0_0_30px_rgba(255,170,0,0.15)]"
            hoverGlow="group-hover:shadow-[0_0_50px_rgba(255,170,0,0.4)]"
            textColor="text-neon-amber"
            imageUrl="https://picsum.photos/800/600?random=3"
            stats={[
              { label: '0-60', value: '3.1s' },
              { label: 'HP', value: '617' },
              { label: 'TOP', value: '190 MPH' }
            ]}
          />

        </div>
      </div>
    </section>
  );
};