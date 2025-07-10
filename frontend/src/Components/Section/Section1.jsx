import React from "react";
import "./Section1.css";
import background from "../../assets/section5-background.png";

const Section1 = ({ children }) => {
  return (
    <div className="section">
      <img src={background} alt="" />
      <div className="content">{children}</div>
    </div>
  );
};

export default Section1;
