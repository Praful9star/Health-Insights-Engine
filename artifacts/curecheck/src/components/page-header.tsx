import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}

export default function PageHeader({ icon, title, subtitle, badge }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {badge && (
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel mono-label text-primary text-xs">
            {icon}
            {badge}
          </span>
        </div>
      )}
      {!badge && (
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">{title}</h1>
      <p className="text-muted-foreground text-center max-w-lg mx-auto leading-relaxed text-sm sm:text-base">{subtitle}</p>
    </motion.div>
  );
}
