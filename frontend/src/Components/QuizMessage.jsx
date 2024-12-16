import React from "react";

const QuizMessage = ({ quiz }) => {
  // Split questions using a more robust regex that handles the specific format
  const questions = quiz.split(/\*\*Question \d+:/).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg bg-gray-800 text-white">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-3">
        Quiz
      </h2>
      <div className="space-y-6">
        {questions.map((questionBlock, index) => {
          // Split the block into question, options, and correct answer
          const [questionAndOptions, correctAnswerBlock] =
            questionBlock.split("Correct Answer:");

          const [questionText, ...options] = questionAndOptions
            ?.split(/(?=\(A\))/)
            .map((item) => item.trim());

          const correctAnswer = correctAnswerBlock?.trim();

          return (
            <div key={index} className="bg-gray-700 p-4 rounded-lg space-y-3">
              {/* Question */}
              <div className="w-full">
                <span className="font-semibold text-lg">
                  {index + 1}. {questionText}
                </span>
              </div>

              {/* Options */}
              {options.map((option, optionIndex) => (
                <div key={optionIndex} className="w-full p-2 text-gray-300">
                  {option}
                </div>
              ))}

              {/* Correct Answer */}
              <div className="w-full text-green-400 font-medium">
                Correct Answer: {correctAnswer}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizMessage;
