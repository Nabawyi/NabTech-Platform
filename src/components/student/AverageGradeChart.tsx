"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface AverageGradeChartProps {
  average: number; // 0 to 100
}

export default function AverageGradeChart({ average }: AverageGradeChartProps) {
  const data = [
    { name: "Score", value: average },
    { name: "Remaining", value: 100 - average },
  ];

  // Determine color based on average
  let primaryColor = "#3b82f6"; // blue-500
  if (average >= 85) primaryColor = "#10b981"; // emerald-500
  else if (average < 50) primaryColor = "#f43f5e"; // rose-500
  else if (average < 65) primaryColor = "#f59e0b"; // amber-500

  const COLORS = [primaryColor, "rgba(148, 163, 184, 0.15)"]; // Second color is for the remaining track

  return (
    <div className="bg-card rounded-[2.5rem] p-8 border border-card-border shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
      <div className="z-10">
        <h3 className="text-muted-fg font-bold text-xs uppercase tracking-widest mb-1">متوسط درجاتي</h3>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-6">
        <motion.div
           initial={{ opacity: 0, scale: 0.5 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
           className="relative flex items-center justify-center w-32 h-32"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={56}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
                cornerRadius={10}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-1">
             <span className="text-2xl font-black tabular-nums" style={{ color: primaryColor }}>
               {average}%
             </span>
          </div>
        </motion.div>
      </div>

      <div className="mt-auto z-10 hidden">
        {/* Invisible spacer to maintain layout balance */}
      </div>
    </div>
  );
}
