import { useState, useRef } from "react";
import "./FileUploader.css";
import { Button } from "@radix-ui/themes";
import Container from "../Container/Container.jsx";

const FileUploader = ({ sessionId, file, setFile, status, setStatus }) => {
  // Definimos el archivo como un estado

  const API_BASE_URL = "https://dia-dtyq.onrender.com";

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

  // Lógica para mostrar el tipo de archivo
  const getFileType = () => {
    if (file && file.type) {
      // Si el navegador proporciona un tipo MIME, lo usamos
      return file.type;
    } else if (file && file.name) {
      // Si no hay tipo MIME, usamos la extensión del archivo
      const parts = file.name.split(".");
      return parts.length > 1 ? `.${parts.pop()}` : "Desconocido";
    }
    return "Desconocido";
  };

  // funcion para manejar el envío del archivo
  async function handleFileUpload() {
    if (!file) {
      console.error("No hay archivo seleccionado.");
      return;
    }

    // Aca irian validaciones de tamaño o tipo de archivo
    // Validación del tipo de archivo
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["db", "sqlite", "sqlite3"];

    if (!allowedExtensions.includes(fileExtension)) {
      console.error("Tipo de archivo no permitido.");
      setStatus("error");

      return;
    }

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    // DEBUG: Verificar FormData
    console.log("FormData creado:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      await fetch(`${API_BASE_URL}/upload-db`, {
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

        {/* Botón Select */}
        <Button
          variant="surface"
          color="tomato"
          size="4"
          highContrast
          style={
            isHovered1
              ? { backgroundColor: "#f0d5d0", marginTop: "10px" }
              : { marginTop: "10px", border: "0px" }
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
              Type: <strong>{getFileType()}</strong>{" "}
            </p>
          </div>
        )}

        {!file && (
          <div className="file-info">
            <p className="text-file-info">
              Extensions allowed: .db .sqlite .sqlite3
            </p>
          </div>
        )}
      </Container>

      <Container className="upload-section">
        {status === "error" && (
          <p className="text-file-info">Error uploading file. Try again.</p>
        )}

        {status === "success" && (
          <div className="success-info">
            <p className="text-file-info">
              Uploaded successfully. Now you can ask queries.
            </p>
          </div>
        )}

        {status === "waiting" && (
          <div className="success-info">
            <p className="text-file-info">
              You are currently using a default database.
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
                  }
                : { marginTop: "10px" }
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
