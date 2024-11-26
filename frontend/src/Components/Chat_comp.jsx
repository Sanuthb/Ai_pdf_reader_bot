import { useState } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../store/slices/chatSlice";
import QuizMessage from "./QuizMessage";

const ChatComp = () => {
  const [question, setQuestion] = useState("");
  const { filename } = useParams();
  const dispatch = useDispatch();

  const messages = useSelector(
    (state) =>
      state.chat.conversations[filename] || [
        {
          type: "response",
          text: "Welcome to the PDF Interaction Hub! 🌟 Easily explore, chat, and engage with your PDFs like never before.",
        },
      ]
  );

  const handleSubmit = async (e) => {
    e?.preventDefault(); // Make preventDefault optional since it might be called without event
    if (!question.trim()) return;

    // Add user message
    dispatch(
      addMessage({
        pdfName: filename,
        message: { type: "user", text: question },
      })
    );

    try {
      const response = await axios.post(
        "http://localhost:8000/ask/",
        { question: question, pdf_name: filename },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Add bot response
      dispatch(
        addMessage({
          pdfName: filename,
          message: { type: "response", text: response.data.answer },
        })
      );
    } catch (error) {
      console.error("Error fetching response:", error);
      dispatch(
        addMessage({
          pdfName: filename,
          message: {
            type: "response",
            text: "Sorry, something went wrong. Try again later.",
          },
        })
      );
    }
    setQuestion("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid newline in input
      handleSubmit();
    }
  };

  const handleQuizClick = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/quiz/",
        { pdf_name: filename },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Add the quiz to messages
      dispatch(
        addMessage({
          pdfName: filename,
          message: { type: "response", text: response.data.quiz },
        })
      );
    } catch (error) {
      console.error("Error fetching quiz:", error);
      dispatch(
        addMessage({
          pdfName: filename,
          message: {
            type: "response",
            text: "Sorry, something went wrong while generating the quiz.",
          },
        })
      );
    }
  };

  return (
    <div className="w-full p-2 flex flex-col gap-5 bg-secondary text-white border-l-[.1rem] border-gray-600">
      <div className="flex items-center justify-between p-2">
        <h1 className="text-xl font-medium">Chat</h1>
        <div className="flex gap-5 text-white">
          <button className="bg-primary p-2 rounded-lg">Images</button>
          <button
            className="bg-primary p-2 rounded-lg"
            onClick={handleQuizClick}
          >
            Quiz
          </button>
        </div>
      </div>
      <div className="w-full h-[80%] overflow-y-scroll p-3 flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.type === "user" ? (
              <p className="max-w-[60%] p-3 rounded-lg bg-primary text-white">
                {msg.text}
              </p>
            ) : (
              <QuizMessage text={msg.text} />
            )}
          </div>
        ))}
      </div>
      <div className="w-full h-14 border-[.1rem] border-gray-600 flex justify-between">
        <input
          type="text"
          className="h-full bg-transparent px-3 w-[90%] focus:outline-none"
          placeholder="Any Questions?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={handleSubmit}
          className="w-[10%] flex items-center justify-center bg-primary"
        >
          <Send size={30} />
        </button>
      </div>
    </div>
  );
};

export default ChatComp;
