import React from "react";
import "./Schema.css";
import { Badge } from "@radix-ui/themes";

const Schema = ({ schema }) => {
  const data = { ...schema };

  // Función para obtener el color del tipo
  const getTypeColor = (type) => {
    switch (type) {
      case "TEXT":
        return "text";
      case "INTEGER":
        return "integer";
      case "TIMESTAMP":
        return "timestamp";
      case "DATETIME":
        return "datetime";
      default:
        return "default";
    }
  };

  //<h3 className="table-name-text"></>
  return (
    <div>
      {Object.entries(data).map(([tableName, fields]) => (
        <div key={tableName} className="div">
          <div className="table-name-container">
            <Badge
              size="2"
              color="brown"
              highContrast
              variant="soft"
              style={{
                fontSize: " 1.2rem",
                textTransform: "capitalize",
                padding: "0.5rem 1rem",
              }}
            >
              {" "}
              {tableName}{" "}
            </Badge>
          </div>

          <div className="fields-container">
            {fields.map((field, index) => (
              <div key={index} className="field-container">
                <span className="">{field.name}</span>
                <span className={`${getTypeColor(field.type)}`}>
                  {field.type}
                </span>
              </div>
            ))}

            <div>
              <span className="total-text">Total: {fields.length} fields</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Schema;
