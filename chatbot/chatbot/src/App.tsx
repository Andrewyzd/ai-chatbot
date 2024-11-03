import {useState} from 'react'
import './App.css'
import {MainContainer, ChatContainer, MessageList} from '@chatscope/chat-ui-kit-react'

const API_KEY = "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";

type Message = {
  text: string,
  sender: 'ai' | 'user'
}

function App() {
  const [ newInputValue, setNewInputValue ] = useState('');
  const [ messages, setMessages ] = useState<Message[]>([
    {
      text: 'This chatbot is developed using chatGPT API developed by OpenAI, ' 
            +'stands as one of the fastest models available for a wide range of everyday tasks. ' 
            +'This AI model is equipped to answer questions and provide assistance with various tasks, ' 
            +'including composing emails, essays, and code.',
      sender: 'ai'
    }
  ]) 

  const newMessage: React.FormEventHandler = async (e) => {
    e.preventDefault();
    // Check if newInputValue is not empty
    if (newInputValue.trim() === '') {
      return;
    }
    //respond from user
    setNewInputValue('');
    const newMessages: Message[] = [...messages, {
      text: newInputValue,
      sender: 'user'
    }];
    //respond from ai
    const response = await fetch(API_KEY, {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages })
    });

    setMessages([...newMessages, {
      sender: 'ai',
      text: await response.text()
    }]);

    await processMessageToChatGPT(newMessages);

  }

  async function processMessageToChatGPT(chatMessages){
    let apiMessage = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "chatGPT"){
        role = "ai";
      }else{
        role = "user";
      }
      return { role: role, content: messageObject.text }
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        ...apiMessage
      ]
    }

    await fetch ("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data.error.message
      );
      setMessages(
        [...chatMessages, {
          sender: 'ai',
          text: data.error.message
        }]
      );
    });

  }

  return <main>
    <MainContainer>
      <h1>Welcome to AI Chatbot</h1>
      <div className='chatContent'>
        <ChatContainer>
          <MessageList>
              {messages.map((messages, index) => <p key={index} className={"message " + messages.sender}>{messages.text}</p>)}

              <form className='input-form' onSubmit={newMessage}>
                <input className='message-send' 
                      type="text" 
                      placeholder='Message'
                      value={newInputValue}
                      onChange={e => setNewInputValue(e.currentTarget.value)}></input>
                <input className='button-send' type="submit" value='Send'></input>
              </form>
          </MessageList>
        </ChatContainer>
      </div>
    </MainContainer>
  </main>
}

export default App
