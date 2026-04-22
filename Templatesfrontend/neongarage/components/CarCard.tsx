import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
}

interface CarCardProps {
  name: string;
  year: string;
  category: string;
  imageUrl: string;
  accentColor: string; // Tailwind border color class
  glowColor: string;   // Tailwind shadow class
  hoverGlow: string;   // Tailwind hover shadow class
  textColor: string;   // Tailwind text color class
  stats: Stat[];
}

export const CarCard: React.FC<CarCardProps> = ({
  name,
  year,
  category,
  imageUrl,
  accentColor,
  glowColor,
  hoverGlow,
  textColor,
  stats
}) => {
  return (
    <div className={`group relative p-1 rounded-xl transition-all duration-500 hover:-translate-y-2`}>
      {/* Outer Glow Effect on Hover */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accentColor.replace('border-', 'bg-')} blur-xl -z-10`}></div>

      {/* Main Card Container */}
      <div className={`h-full glass-panel flex flex-col rounded-lg overflow-hidden border ${accentColor} ${glowColor} ${hoverGlow} transition-all duration-500`}>
        
        {/* Image Container with Sketch Filter */}
        <div className="relative aspect-[4/3] overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
          
          {/* Tech Grid Overlay */}
          <div className="absolute inset-0 z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover sketch-filter transform group-hover:scale-105 transition-transform duration-700"
          />

          {/* Floating UI Elements on Image */}
          <div className="absolute top-4 left-4 z-20">
            <span className={`text-[10px] font-bold tracking-[0.2em] border border-white/20 bg-black/50 backdrop-blur-md px-2 py-1 rounded ${textColor}`}>
              {category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-20">
            <p className="text-white/60 text-xs font-mono mb-1">{year}</p>
            <h3 className="text-2xl font-display font-bold text-white leading-none tracking-wide">{name}</h3>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 flex-grow flex flex-col justify-between relative">
           {/* Decorative Lines */}
           <div className={`absolute top-0 right-0 w-20 h-[1px] ${textColor} opacity-50`}></div>

           {/* Stats Grid */}
           <div className="grid grid-cols-3 gap-4 mb-6">
             {stats.map((stat, idx) => (
               <div key={idx} className="flex flex-col">
                 <span className="text-[10px] text-white/30 tracking-wider mb-1">{stat.label}</span>
                 <span className="text-lg font-display font-medium text-white">{stat.value}</span>
               </div>
             ))}
           </div>

           {/* Action */}
           <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
             <span className="text-xs text-white/40 group-hover:text-white transition-colors">VIEW SCHEMATICS</span>
             <button className={`w-8 h-8 rounded flex items-center justify-center border border-white/10 hover:border-white/40 ${textColor} hover:bg-white/5 transition-all`}>
               <ArrowUpRight size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};