import "./App.css";
import Section1 from "./Components/Section/Section1";
import Container from "./Components/Container/Container";
import Title from "./Components/Title/Title";
import Chat from "./Components/Chat/Chat";
import Footer from "./Components/Footer/Footer.jsx";
import React, { useState, useEffect, useRef } from "react";
import { Spinner, TextArea } from "@radix-ui/themes";
import MessageBox from "./Components/MessageBox/MessageBox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // para listas, tablas, checkboxes

function App() {
  const [show, setShow] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [thinking, setThinking] = useState(false); // Estado para indicar si el chatbot está "pensando"
  const messagesContainerRef = useRef(null); // Referencia al contenedor de mensajes

  // UseEffect para agregar la clase show para el titulo
  useEffect(() => {
    setTimeout(() => setShow(true), 100); // Agrega la clase después de 100ms
  }, []);

  // UseEffect para obtener el ID de la sesión
  useEffect(() => {
    fetch("http://127.0.0.1:8000/session", {
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
      console.log("Element found, scrolling...");
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    } else {
      console.log("Element NOT found");
    }
    console.log("=== END DEBUG ===");
  }, [messages, thinking]);

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

    fetch("http://127.0.0.1:8000/query", {
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
        <Container className="container">
          <Container className="section-a-container">
            <Title clase={`element ${show ? "show" : ""}`}>
              Empowering Humanity Through AI
            </Title>
          </Container>

          <Container className="chat-container">
            <Chat>
              <Container
                className="messages-container"
                ref={messagesContainerRef}
              >
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
      </Section1>

      <Footer>
        <p className="footer-text">© 2025 IDQA. All rights reserved.</p>
      </Footer>
    </div>
  );
}

export default App;
