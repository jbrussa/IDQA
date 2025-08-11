import React from "react";
import "./Schema.css";

const Schema = () => {
  const data = {
    sesiones: [
      {
        name: "id",
        type: "TEXT",
      },
      {
        name: "ip",
        type: "TEXT",
      },
      {
        name: "fecha",
        type: "TIMESTAMP",
      },
    ],
    historial: [
      {
        name: "id",
        type: "INTEGER",
      },
      {
        name: "idsession",
        type: "other",
      },
      {
        name: "rol",
        type: "TEXT",
      },
      {
        name: "mensaje",
        type: "TEXT",
      },
      {
        name: "fecha_hora",
        type: "DATETIME",
      },
    ],
  };

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

  return (
    <div>
      {Object.entries(data).map(([tableName, fields]) => (
        <div key={tableName} className="div">
          <div className="table-name-container">
            <h3 className="table-name-text">{tableName}</h3>
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
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Total: {fields.length} campos
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Schema;
