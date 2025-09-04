import { useState, useRef } from "react";
import "./FileUploader.css";
import { Button } from "@radix-ui/themes";
import Container from "../Container/Container.jsx";

const FileUploader = ({ sessionId }) => {
  // Definimos el archivo como un estado
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("waiting"); // Estado para manejar el estado del archivo
  const [isHovered1, setIsHovered1] = useState(false); // Estado para manejar el hover del boton
  const [isHovered2, setIsHovered2] = useState(false); // Estado para manejar el hover del boton

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
      <Container className="select-section">
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          // accept=".db,.sqlite,.sqlite3"
          style={{ display: "none" }} // ← OCULTO
        />

        <Container className="text-container">
          <p className="text-upload"> Choose your database</p>
        </Container>

        {/* Botón Upload */}
        <Button
          variant="surface"
          color="tomato"
          size="4"
          highContrast
          style={
            isHovered1
              ? { backgroundColor: "#f0d5d0", marginTop: "10px" }
              : { marginTop: "10px" }
          }
          onMouseEnter={() => setIsHovered1(true)}
          onMouseLeave={() => setIsHovered1(false)}
          onClick={() => {
            handleButtonClick();
          }}
        >
          Select from your device
        </Button>

        {/* Informacion de file */}
        {file && (
          <div className="file-info">
            <p className="text-file-info">
              File name: <strong>{file.name}</strong>{" "}
            </p>
            <p className="text-file-info">
              Size: <strong>{(file.size / 1024).toFixed(2)} KB</strong>{" "}
            </p>
            <p className="text-file-info">
              Type: <strong>{file.type}</strong>{" "}
            </p>
          </div>
        )}
      </Container>

      <Container className="upload-section">
        {status === "error" && (
          <p className="error-message">
            Error al subir el archivo. Inténtalo de nuevo.
          </p>
        )}

        {status === "success" && (
          <div className="success-info">
            <p className="text-file-info">
              Subido correctamente. Ahora puedes hacer consultas.
            </p>
          </div>
        )}

        {file && status !== "uploading" && (
          <Button
            variant="surface"
            color="tomato"
            size="4"
            highContrast
            style={
              isHovered2
                ? {
                    backgroundColor: "#f0d5d0",
                    marginTop: "10px",
                    justifyContent: "end",
                  }
                : { marginTop: "10px", justifyContent: "end" }
            }
            onMouseEnter={() => setIsHovered2(true)}
            onMouseLeave={() => setIsHovered2(false)}
            onClick={() => {
              handleFileUpload();
            }}
          >
            Upload
          </Button>
        )}
      </Container>
    </div>
  );
};

export default FileUploader;
