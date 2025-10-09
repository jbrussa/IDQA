import React, { forwardRef } from "react";
import "./Section2.css";
import background1 from "../../assets/section6-background.png";
import background2 from "../../assets/section6-background.png";

const Section2 = forwardRef(({ children }, ref) => {
  return (
    <div className="section" ref={ref}>
      <img className="escritorio" src={background1} alt="" />
      <img className="movil" src={background2} alt="" />

      <div className="content">{children}</div>
    </div>
  );
});

export default Section2;
