import { useState, useRef } from "react";
import "./FileUploader.css";

const FileUploader = ({ sessionId }) => {
  // Definimos el archivo como un estado
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("waiting"); // Estado para manejar el estado del archivo

  const fileInputRef = useRef(null); // Referencia para conectar el boton del input y el boton personalizado

  // Manejo de errores de selección de archivos
  function handleFileChange(e) {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      console.log("Archivo seleccionado:", selectedFile.name);
    } else {
      console.log("No se ha seleccionado ningún archivo.");
    }
  }

  // funcion para manejar el envío del archivo
  async function handleFileUpload() {
    //! DEBUG: Verificar sessionId
    console.log("=== DEBUG UPLOAD ===");
    console.log("sessionId recibido:", sessionId);
    console.log("Tipo de sessionId:", typeof sessionId);
    console.log(
      "sessionId es válido:",
      sessionId && typeof sessionId === "string"
    );

    if (!file) {
      console.error("No hay archivo seleccionado.");
      return;
    }

    // Aca irian validaciones de tamaño o tipo de archivo

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    // DEBUG: Verificar FormData
    console.log("FormData creado:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      //! DEBUG
      console.log("Enviando request con sessionId:", sessionId);
      await fetch("http://127.0.0.1:8000/upload-db", {
        method: "POST",
        body: formData,
        headers: { id: sessionId },
      });
      setStatus("success");
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setStatus("error");
    }
  }

  // Función para abrir el selector de archivos
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        // accept=".db,.sqlite,.sqlite3"
        style={{ display: "none" }} // ← OCULTO
      />

      {/* Botón personalizado */}
      <button onClick={handleButtonClick} className="upload-button">
        📁 Seleccionar Base de Datos
      </button>

      {file && (
        <div className="file-info">
          <p>
            Archivo seleccionado: <strong>{file.name}</strong>{" "}
          </p>
          <p>
            Size: <strong>{(file.size / 1024).toFixed(2)} KB</strong>{" "}
          </p>
          <p>
            Type: <strong>{file.type}</strong>{" "}
          </p>
        </div>
      )}

      {file && status !== "uploading" && (
        <button onClick={handleFileUpload}> Upload </button>
      )}

      {status === "error" && (
        <p className="error-message">
          Error al subir el archivo. Inténtalo de nuevo.
        </p>
      )}

      {status === "success" && (
        <p className="success-message">
          Subido correctamente. Ahora puedes hacer consultas.
        </p>
      )}
    </div>
  );
};

export default FileUploader;
