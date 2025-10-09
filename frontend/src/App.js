import "./App.css";
import Section1 from "./Components/Section/Section1";
import Section2 from "./Components/Section/Section2";
import Container from "./Components/Container/Container";
import FileUploader from "./Components/FileUploader/FileUploader";
import Schema from "./Components/Schema/Schema.jsx";
import Title from "./Components/Title/Title";
import Chat from "./Components/Chat/Chat";
import Footer from "./Components/Footer/Footer.jsx";
import React, { useState, useEffect, useRef } from "react";
import { Spinner, TextArea, Button, Tabs } from "@radix-ui/themes";
import MessageBox from "./Components/MessageBox/MessageBox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // para listas, tablas, checkboxes

function App() {
  const API_BASE_URL = "https://dia-dtyq.onrender.com";

  //* Estados y referencias *//
  const [show, setShow] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [thinking, setThinking] = useState(false); // Estado para indicar si el chatbot está "pensando"
  const messagesContainerRef = useRef(null); // Referencia al contenedor de mensajes
  const section2Ref = useRef(null); // Referencia al section2

  // Estados de archivo subido
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("waiting");

  // Estados para el esquema
  const [schemaData, setSchemaData] = useState(null);

  //* UseEffect *//
  // UseEffect para agregar la clase show para el titulo
  useEffect(() => {
    setTimeout(() => setShow(true), 100); // Agrega la clase después de 100ms
  }, []);

  // UseEffect para obtener el ID de la sesión
  useEffect(() => {
    fetch(`${API_BASE_URL}/session`, {
      method: "POST", // Especifica que es una solicitud GET
    })
      .then((response) => response.json())
      .then((data) => {
        setSessionId(data.id); // Asumiendo que la respuesta es { "id": session_id }
        console.log("Sesión obtenida");
      })
      .catch((error) => {
        console.error("Error al obtener la sesión:", error);
      });
  }, []); // Solo se ejecuta una vez al montar el componente

  // UseEffect para hacer scroll al último mensaje SOLO dentro del contenedor
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    } else {
      console.log("Element NOT found");
    }
  }, [messages, thinking]);

  // UseEffect para obtener el esquema de la base de datos cuando cambia el status a "uploaded"
  useEffect(() => {
    if (sessionId) {
      fetch(`${API_BASE_URL}/schema`, {
        headers: { id: sessionId },
      })
        .then((response) => response.json())
        .then((data) => {
          setSchemaData(data);
        })
        .catch((error) => {
          console.error("Error al obtener el esquema:", error);
        });
    }
  }, [sessionId, status]);

  // useEffect para vaciar el chat al subir un archivo
  useEffect(() => {
    if (status === "success") {
      setMessages([]);
    }
  }, [status]);

  //* FUNCIONES *//
  // function para hacer scroll a section 2
  const scrollSection2 = () => {
    if (section2Ref.current) {
      section2Ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start", // Opcional: controla dónde se posiciona
      });
    }
  };

  // función para enviar mensajes al chatbot
  const sendMessage = (query) => {
    if (!sessionId) {
      console.error("No hay sesión activa.");
      return;
    }

    const newQueryMessage = {
      type: "query",
      text: query,
    };
    // Actualizar el estado con el nuevo mensaje de consulta
    setMessages((prevMessages) => [...prevMessages, newQueryMessage]);

    // Activar el estado de "pensando" mientras se espera la respuesta
    setThinking(true);

    fetch(`${API_BASE_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", id: sessionId },
      body: JSON.stringify({ query }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Agregar las respuestas a la lista de mensajes
        const newResponseMessage = {
          type: "response",
          text: data.response,
        };
        // Actualizamos el estado con la nueva respuesta
        setMessages((prevMessages) => [...prevMessages, newResponseMessage]);

        // Desactivar el estado de "pensando" una vez recibida la respuesta
        setThinking(false);
      })
      .catch((error) => console.error("Error al llamar a /query:", error));
  };

  return (
    <div className="App">
      <Section1>
        <Container className="section1">
          <Container className="text-section1">
            <Container className="title-container">
              <Title clase={`element ${show ? "show" : ""}`}>
                Empowering Humanity Through AI
              </Title>
            </Container>

            <Container className="subtitle-container">
              <p className="subtitle">
                DIA is an AI-powered platform that enables natural language
                interaction with your databases. It allows you to upload a
                database and ask questions to obtain instant insights,
                eliminating the need for technical queries or advanced database
                knowledge.
              </p>
            </Container>
            <Container className="button-container">
              <Button
                variant="solid"
                color="tomato"
                size="4"
                highContrast
                style={{ border: " 1px solid #e0e0e0" }}
                onClick={() => {
                  scrollSection2();
                }}
              >
                Get started!
              </Button>
            </Container>
          </Container>
        </Container>
      </Section1>

      <Section2 ref={section2Ref}>
        <Container className="container">
          <Container className="section-a-container">
            <Container className="section-a-box">
              <Tabs.Root className="tabs-list" defaultValue="upload">
                <div className="tabs-header">
                  <Tabs.List size="1" color="tomato">
                    <Tabs.Trigger value="upload">Upload</Tabs.Trigger>
                    <Tabs.Trigger value="schema">Schema</Tabs.Trigger>
                  </Tabs.List>
                </div>

                <Tabs.Content
                  className="tabs-content-container-upload"
                  value="upload"
                >
                  <FileUploader
                    sessionId={sessionId}
                    file={file}
                    setFile={setFile}
                    status={status}
                    setStatus={setStatus}
                  />
                </Tabs.Content>

                <Tabs.Content
                  className="tabs-content-container-schema"
                  value="schema"
                >
                  <Schema schema={schemaData}></Schema>
                </Tabs.Content>
              </Tabs.Root>
            </Container>
          </Container>

          <Container className="chat-container">
            <Chat>
              <Container
                className="messages-container"
                ref={messagesContainerRef}
              >
                {sessionId == null && (
                  <div className="initial-loading">
                    <Spinner size="3" /> {/* Utiliza tu componente Spinner */}
                    <p>Connecting to server...</p> {/* Mensaje opcional */}
                  </div>
                )}
                {messages.map((message, index) => (
                  <MessageBox key={index} className={message.type}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </MessageBox>
                ))}
                {thinking && (
                  <MessageBox className="response think">
                    <Spinner />
                  </MessageBox>
                )}
              </Container>

              <Container className="input-container">
                <TextArea
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  variant="surface"
                  placeholder="Ask your query..."
                  className="input-textarea"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "15px",
                  }}
                />
              </Container>
            </Chat>
          </Container>
        </Container>
      </Section2>

      <Footer>
        <p className="footer-text">© 2025 DIA. All rights reserved.</p>
      </Footer>
    </div>
  );
}

export default App;
