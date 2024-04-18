import { useEffect, useState } from "react";
import "./App.css";
import {
  PageHeader,
  PageFooter,
  FontFaces,
} from "@nn-design-system/react-component-library";
import getNnFontPaths from "@nn-design-system/fonts/dist/vite";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { Container } from "@mui/system";
import { footerSecondaryItems, pageFooterItems } from "./footer-items";
import {
  headerNavigationItems,
  headerSubnavigationItems,
} from "./header-items.js";

const API_ENDPOINT = "http://localhost:3000/ask";

const MESSAGE_TYPE = {
  SYSTEM: "system", // initial message
  ASSISTANT: "assistant", //responses from chat-gpt
  USER: "user", // prompt from user
};

const App = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: MESSAGE_TYPE.SYSTEM,
    },
  ]);
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      const chatGptContainer = document.getElementsByClassName(
        "cs-message-list__scroll-wrapper",
      )[0];
      chatGptContainer.scrollTop = chatGptContainer.scrollHeight + 25;
    }
  }, [messages]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAttachClick = () => {
    document.getElementById("fileid").click();
  };

  const handleSendRequest = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: MESSAGE_TYPE.USER,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true);

    try {
      const response = await processMessageToChatGPT([...messages, newMessage]);
      // const content = response[0]?.text;
      const content = response[0]?.message?.content;
      if (content) {
        const chatGPTResponse = {
          message: content,
          sender: MESSAGE_TYPE.ASSISTANT,
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender;
      return { role, content: messageObject.message };
    });

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        // prompt: apiMessages.map(message => message.content),
        prompt: apiMessages,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const reseived = await response.json();

    return reseived;
  }

  return (
    <div className="App">
      <FontFaces paths={getNnFontPaths()} />
      <PageHeader
        navigationItems={headerNavigationItems}
        logoUrl={""}
        authenticationProps={{
          loginButtonText: "Login",
          loginUrl: "#",
          logoutUrl: "#",
          logoutButtonText: "Logout",
          userNavigationItems: [
            {
              text: "User name",
            },
          ],
        }}
        secondaryNavigationItems={headerSubnavigationItems}
      />
      <Container
        maxWidth="lg"
        sx={{
          height: "700px",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      >
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="ChatGPT is typing" />
                ) : null
              }
            >
              {messages.map((message, i) => {
                return (
                  <Message
                    key={i}
                    model={message}
                    className={`message_${message.sender}`}
                  />
                );
              })}
            </MessageList>
            <MessageInput
              placeholder="Send a Message"
              onSend={handleSendRequest}
              onAttachClick={handleAttachClick}
            />
          </ChatContainer>
        </MainContainer>
      </Container>
      <input id="fileid" type="file" onChange={handleFileChange} hidden />
      <PageFooter
        items={pageFooterItems}
        secondaryItems={footerSecondaryItems}
      />
    </div>
  );
};

export default App;
