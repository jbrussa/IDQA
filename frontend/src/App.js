import "./App.css";
import Section1 from "./Components/Section/Section1";
import Container from "./Components/Container/Container";
import Title from "./Components/Title/Title";
import Chat from "./Components/Chat/Chat";
import React, { useState, useEffect } from "react";
import { Form } from "radix-ui";
import { Theme, TextArea } from "@radix-ui/themes";


function App() {

  const [show, setShow] = useState(false);

  // UseEffect para agregar la clase show para el titulo
    useEffect(() => {
        setTimeout(() => setShow(true), 100); // Agrega la clase después de 100ms
    }, []);
  
  return (
    <div className="App">
      
        <Section1>
        <Container className="container">
          
          <Container className="section-a-container">
            <h2>Chat with Us</h2>
            <Title clase={`element ${show ? "show" : ""}`}>Empowering Humanity Through AI</Title>

          </Container>

          <Container className="chat-container">
            <Chat>
              
              <Container className="messages-container">
                a
              </Container>

              <Container className="input-container">
                <TextArea variant="surface" placeholder="Ask your query..." style={{ width: "100%", height: "100%", borderRadius: "15px" }}  />
              </Container>

              
            </Chat>
          </Container>          

        </Container>
      </Section1>
      
    </div>
  );
}

export default App;
