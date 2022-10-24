import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import IconHeart from "../src/image/heart-white.png"
import IconHeartRed from "../src/image/heart-red.png";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes() +
          ":" +
          new Date(Date.now()).getSeconds(),
        id: Math.random(),
        heart: false
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  const handleHeart = async (message) => {
    const messageData = {
      ...message,
      heart: !message.heart,
    };
    await socket.emit("heart", messageData);
    const idx = messageList.findIndex((item) => item.id === message.id);
    const new_list = [...messageList];
    new_list[idx].heart = messageData.heart;
    setMessageList(new_list);
  }

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => {
        const idx = list.findIndex(item => item.id === data.id);
        if (idx > -1) {
          return [...list, data];
        } else {
          let new_list = [...list];
          new_list[idx] = data;
          return [...new_list];
        }
      });
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "other" : "you"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                    {messageContent?.heart ? (
                      <img
                        onClick={() => handleHeart(messageContent)}
                        src={IconHeartRed}
                        className="icon-heart"
                        alt="icon-heart"
                      />
                    ) : (
                      <img
                        onClick={() => handleHeart(messageContent)}
                        src={IconHeart}
                        className="icon-heart"
                        alt="icon-heart"
                      />
                    )}
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
