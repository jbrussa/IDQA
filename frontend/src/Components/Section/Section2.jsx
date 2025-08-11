import React, { forwardRef } from "react";
import "./Section2.css";
import background from "../../assets/section6-background.png";

const Section2 = forwardRef(({ children }, ref) => {
  return (
    <div className="section" ref={ref}>
      <img src={background} alt="" />
      <div className="content">{children}</div>
    </div>
  );
});

export default Section2;
