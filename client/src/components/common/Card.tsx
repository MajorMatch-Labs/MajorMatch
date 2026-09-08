import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glow }) => {
  return (
    <div
      className={clsx(
        "rounded-2xl p-6 transition-all duration-200",
        glow ? "glass-panel-glow" : "glass-panel",
        className
      )}
    >
      {children}
    </div>
  );
};
