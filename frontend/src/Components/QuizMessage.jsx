import React from "react";

const QuizMessage = ({ quiz }) => {
  const questions = quiz.split(/\*\*\d+\.\s/).filter(Boolean);

  console.log(questions);

  return (
    <div className="max-w-[80%] p-4 rounded-lg bg-gray-800 text-white">
      <h2 className="text-xl font-bold mb-4">Quiz</h2>
      <div className="space-y-6">
        {questions.map((questionBlock, index) => {
          const [questionAndOptions, correctAnswerBlock] =
            questionBlock.split("**Correct Answer:");

          const [questionText, ...options] = questionAndOptions
            ?.split(/(?=\(A\))/)
            .map((item) => item.trim());
          const correctAnswer = correctAnswerBlock?.trim();

          return (
            <div key={index} className="space-y-2">
              <p className="font-semibold">
                {index + 1}. {questionText}
              </p>
              <div className="pl-4 space-y-1">
                {options.map((option, optionIndex) => (
                  <p
                    key={optionIndex}
                    className={`${
                      correctAnswer?.includes(option.charAt(1))
                        ? "text-green-400 font-medium"
                        : ""
                    }`}
                  >
                    {option}
                  </p>
                ))}
              </div>
              <p className="text-green-400 font-medium mt-2">
                Correct Answer: {correctAnswer}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizMessage;
