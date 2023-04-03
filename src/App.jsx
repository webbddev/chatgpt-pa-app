import { useState } from 'react';
const API_KEY = import.meta.env.VITE_API_KEY;
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
import Navbar from './components/Navbar';

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: 'Hi, I am Nik, your Personal Smarta@@',
      sender: 'ChatGPT',
    },
  ]);

  const handleSend = async (message) => {
    const newMessage =
      {
        message: message,
        sender: 'user',
        direction: 'outgoing',
      } || [];

    const newMessages = [...messages, newMessage]; // total old messages + the new message
    // updating messages state
    setMessages(newMessages);
    // setting a typing indicator (e.g. chatGpt is typing)
    setTyping(true);
    // processing message to chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = '';
      if (messageObject.sender === 'ChatGPT') {
        role = 'assistant';
      } else {
        role = 'user';
      }
      return { role: role, content: messageObject.message };
    });

    // role: 'user' -> a message from the user, 'assistant' -> a response from ChatGPT, 'system' -> generally one initial message defining HOW we expect ChatGPT to talk to us

    const systemMessage = {
      role: 'system',
      content: 'Explain like I am a 10 years of experience software engineer.',
      // content: 'Explain all concepts like I am 10 years old.',
    };

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...apiMessages],
    };

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: 'ChatGPT',
          },
        ]);
        setTyping(false);
      });
  }

  return (
    <div className="App">
      <div style={{ position: 'relative', height: '80vh', width: '80vw' }}>
        <Navbar />
        <MainContainer responsive>
          {/* <Avatar className="avatar" src={img} name={'Nik'} size="sm" /> */}
          <ChatContainer>
            <MessageList
              style={{ background: '#E5DCD7', opacity: '0.5' }}
              scrollBehavior="smooth"
              typingIndicator={
                typing ? <TypingIndicator content="Nik is typing" /> : null
              }
            >
              {messages.map((message, index) => {
                return <Message key={index} model={message} />;
              })}
            </MessageList>
            <MessageInput
              attachButton={false}
              placeholder="Type message here..."
              onSend={handleSend}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
