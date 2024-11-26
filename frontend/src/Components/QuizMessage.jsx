const QuizMessage = ({ text }) => {
  // Check if the message is a quiz (contains "Quiz" and numbered questions)
  const isQuiz = text.includes("Quiz") && /\d+\.\s+What/.test(text);

  if (!isQuiz)
    return (
      <p className="max-w-[60%] p-3 rounded-lg bg-[#3c3d37] text-white">
        {text}
      </p>
    );

  // Split the quiz into questions
  const questions = text.split(/(?=\*\*\d+\.\s+What)/).filter((q) => q.trim());

  return (
    <div className="max-w-[80%] p-4 rounded-lg bg-[#3c3d37] text-white">
      <h2 className="text-xl font-bold mb-4">Quiz</h2>
      <div className="space-y-6">
        {questions.map((question, idx) => {
          // Extract question components
          const [questionText, options, answer] = question
            .replace(/\*\*/g, "")
            .split(/(?=\(a\))/)
            .map((str) => str.trim());

          // Format options
          const optionsList = options
            ?.split(/(?=\([a-d]\))/)
            .map((opt) => opt.trim())
            .filter(Boolean);

          return (
            <div key={idx} className="space-y-2">
              <p className="font-semibold">{questionText}</p>
              <div className="pl-4 space-y-1">
                {optionsList?.map((option, optIdx) => (
                  <p
                    key={optIdx}
                    className={`${
                      answer?.includes(option.charAt(1))
                        ? "text-green-400 font-medium"
                        : ""
                    }`}
                  >
                    {option}
                  </p>
                ))}
              </div>
              <p className="text-green-400 font-medium mt-2">
                {answer?.replace("Correct Answer:", "✓ Correct Answer:")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizMessage