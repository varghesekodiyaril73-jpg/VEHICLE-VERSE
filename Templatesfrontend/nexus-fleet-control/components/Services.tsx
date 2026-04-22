import React from 'react';
import { TriangleAlert, CalendarClock, Activity } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { motion } from 'framer-motion';

const services = [
  {
    icon: TriangleAlert,
    title: "Emergency Breakdown",
    desc: "Instant rapid response units deployed via quantum geolocation. 24/7 recovery support with <15min ETA.",
    color: "#ff2a6d"
  },
  {
    icon: CalendarClock,
    title: "Regular Service Booking",
    desc: "AI-driven scheduling that predicts maintenance windows based on vehicle telemetry and usage patterns.",
    color: "#00f3ff"
  },
  {
    icon: Activity,
    title: "Live Diagnostics",
    desc: "Continuous drivetrain monitoring. Detect faults before they occur with deep-learning anomaly detection.",
    color: "#bc13fe"
  }
];

const Services: React.FC = () => {
  return (
    <section className="relative z-10 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Service Modules</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-[#ff2a6d] via-[#00f3ff] to-[#bc13fe] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="h-full p-8 group cursor-pointer" hoverEffect={true}>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:border-[color:var(--icon-color)] transition-colors duration-300"
                  style={{ '--icon-color': service.color } as React.CSSProperties}
                >
                  <service.icon 
                    size={28} 
                    style={{ color: service.color }} 
                    className="group-hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300" 
                  />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[color:var(--text-color)] transition-colors"
                    style={{ '--text-color': service.color } as React.CSSProperties}>
                  {service.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {service.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;