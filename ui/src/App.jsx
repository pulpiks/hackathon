import { useState }  from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

const API_ENDPOINT = 'http://localhost:3000/ask'

const MESSAGE_TYPE = {
  SYSTEM: 'system', // initial message
  ASSISTANT: 'assistant', //responses from chat-gpt
  USER: 'user' // prompt from user
}

const App = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: MESSAGE_TYPE.SYSTEM,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendRequest = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: MESSAGE_TYPE.USER,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true);

    try {
      const response = await processMessageToChatGPT([...messages, newMessage]);
      const content = response.data[0]?.text;
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
    console.log(chatMessages);
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === MESSAGE_TYPE.ASSISTANT ? MESSAGE_TYPE.ASSISTANT : MESSAGE_TYPE.USER;
      return { role, content: messageObject.message };
    });

    console.log(chatMessages[chatMessages.length-1].message);

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        prompt: chatMessages[chatMessages.length-1].message,
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
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} className={`message_${message.sender}`}/>
              })}
            </MessageList>
            <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App;