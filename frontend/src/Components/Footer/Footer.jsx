import React from "react";
import "./Footer.css"; // Importa el archivo CSS para estilos

const footer = ({ children }) => {
  return <div className="footer"> {children} </div>;
};

export default footer;
