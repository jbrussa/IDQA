import "./App.css";
import Section1 from "./Components/Section/Section1";
import Container from "./Components/Container/Container";
import Title from "./Components/Title/Title";
import Chat from "./Components/Chat/Chat";
import React, { useState, useEffect, useRef } from "react";
import { TextArea } from "@radix-ui/themes";
import MessageBox from "./Components/MessageBox/MessageBox";

function App() {

  const [show, setShow] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [thinking, setThinking] = useState(false); // Estado para indicar si el chatbot está "pensando"
  const messagesEndRef = useRef(null); // Referencia al final del chat para hacer scroll
  

  // UseEffect para agregar la clase show para el titulo
    useEffect(() => {
        setTimeout(() => setShow(true), 100); // Agrega la clase después de 100ms
    }, []);
  
  // UseEffect para obtener el ID de la sesión
    useEffect(() => {
      fetch('http://127.0.0.1:8000/session', {
        method: 'POST',  // Especifica que es una solicitud GET
      }) 
        .then(response => response.json())
        .then(data => {
          setSessionId(data.id); // Asumiendo que la respuesta es { "id": session_id }
          console.log('Sesión obtenida');
        })
        .catch(error => {
          console.error('Error al obtener la sesión:', error);
        });
    }, []); // Solo se ejecuta una vez al montar el componente

     // UseEffect para hacer scroll al último mensaje
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]); // Se ejecuta cuando cambian los mensajes

  
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
      headers: { "Content-Type": "application/json", "id": sessionId },
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
            <Title clase={`element ${show ? "show" : ""}`}>Empowering Humanity Through AI</Title>

          </Container>

          <Container className="chat-container">
            <Chat>
              
              <Container className="messages-container">
                {messages.map((message, index) => (
                <MessageBox key={index} className={message.type}>
                  {message.text}
                </MessageBox>
              ))}
                <div ref={messagesEndRef} />

              </Container>

              <Container className="input-container">
                <TextArea 
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  sendMessage(e.target.value);
                  e.target.value = "";}}}
                variant="surface" 
                placeholder="Ask your query..." 
                style={{ width: "100%", height: "100%", borderRadius: "15px" }}  />
              </Container>

              
            </Chat>
          </Container>          

        </Container>
      </Section1>
      
    </div>
  );
}

export default App;
