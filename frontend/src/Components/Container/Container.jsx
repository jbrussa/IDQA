import React, { forwardRef } from "react";
import "./Container.css";

// Usar forwardRef para pasar la referencia al div interno, que se usa para el scroll al último mensaje
const Container = forwardRef(({ children, className = " " }, ref) => {
  return (
    <div className={`${className}`} ref={ref}>
      {children}
    </div>
  );
});

export default Container;
