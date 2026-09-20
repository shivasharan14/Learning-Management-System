import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import styles from "./AttemptQuiz.module.css";

const AttemptQuiz = () => {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [myResult, setMyResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/quizzes/${quizId}/student`)
      .then((response) => setQuiz(response.data.quiz))
      .catch((error) => console.log(error));

    axiosInstance
      .get(`/quizzes/${quizId}/my-result`)
      .then((response) => setMyResult(response.data.result))
      .catch(() => setMyResult(null))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const answersArray = Object.keys(answers).map((questionId) => ({
      questionId,
      selectedAnswer: answers[questionId],
    }));

    if (answersArray.length !== quiz.questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);

    try {
      await axiosInstance.post(`/quizzes/${quizId}/submit`, {
        answers: answersArray,
      });

      toast.success("Quiz submitted successfully!");

      const resultResponse = await axiosInstance.get(
        `/quizzes/${quizId}/my-result`
      );

      setMyResult(resultResponse.data.result);
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={styles.notFound}>
        <div>📝</div>
        <h1>Quiz Not Found</h1>
        <p>The quiz you're looking for is unavailable.</p>
      </div>
    );
  }

  /* ================= RESULT ================= */

  if (myResult) {
    return (
      <div className={styles.page}>

        <div className={styles.resultContainer}>

          <div className={styles.resultHeader}>
            <span className={styles.resultBadge}>
              QUIZ COMPLETED
            </span>

            <h1>{quiz.title}</h1>

            <p>Your quiz has been submitted successfully.</p>
          </div>

          {/* Score Card */}

          <div className={styles.scoreCard}>

            <div className={styles.scoreCircle}>
              <strong>{myResult.percentage}%</strong>
              <span>Score</span>
            </div>

            <div className={styles.scoreDetails}>
              <div>
                <span>Marks Obtained</span>
                <strong>
                  {myResult.score} / {myResult.totalMarks}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong className={styles.passed}>
                  ✓ Submitted
                </strong>
              </div>
            </div>

          </div>

          {/* Review */}

          <div className={styles.reviewSection}>

            <div className={styles.reviewHeader}>
              <h2>Answer Review</h2>
              <span>
                {quiz.questions.length} Questions
              </span>
            </div>

            {quiz.questions.map((q, index) => {

              const yourAnswer = myResult.answers.find(
                (a) => a.questionId === q._id
              );

              const isCorrect = yourAnswer?.isCorrect;

              return (
                <div
                  key={q._id}
                  className={`${styles.reviewCard} ${
                    isCorrect
                      ? styles.correctCard
                      : styles.wrongCard
                  }`}
                >

                  <div className={styles.questionTop}>

                    <span className={styles.questionNumber}>
                      Q{index + 1}
                    </span>

                    <span
                      className={
                        isCorrect
                          ? styles.correctBadge
                          : styles.wrongBadge
                      }
                    >
                      {isCorrect
                        ? "✓ Correct"
                        : "✕ Wrong"}
                    </span>

                  </div>

                  <h3>{q.question}</h3>

                  <div className={styles.answerInfo}>

                    <div>
                      <span>Your Answer</span>

                      <strong>
                        {yourAnswer?.selectedAnswer || "Not answered"}
                      </strong>
                    </div>

                    {!isCorrect && (
                      <div>
                        <span>Correct Answer</span>

                        <strong className={styles.correctText}>
                          {q.correctAnswer}
                        </strong>
                      </div>
                    )}

                    <div>
                      <span>Marks</span>

                      <strong>
                        {yourAnswer?.marksObtained || 0} / {q.marks}
                      </strong>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </div>
    );
  }

  /* ================= QUIZ ================= */

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className={styles.page}>

      <div className={styles.quizContainer}>

        {/* Quiz Header */}

        <div className={styles.quizHeader}>

          <div>
            <span className={styles.quizBadge}>
              ASSESSMENT
            </span>

            <h1>{quiz.title}</h1>

            <p>{quiz.description}</p>
          </div>

          <div className={styles.quizStats}>

            <div>
              <strong>{totalQuestions}</strong>
              <span>Questions</span>
            </div>

            <div>
              <strong>{quiz.totalMarks}</strong>
              <span>Total Marks</span>
            </div>

          </div>

        </div>

        {/* Progress */}

        <div className={styles.answerProgress}>

          <div className={styles.progressHeader}>
            <span>Quiz Progress</span>

            <strong>
              {answeredCount} / {totalQuestions} answered
            </strong>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{
                width: `${
                  totalQuestions
                    ? (answeredCount / totalQuestions) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>

        </div>

        {/* Questions */}

        <form onSubmit={handleSubmit}>

          <div className={styles.questions}>

            {quiz.questions.map((q, index) => (

              <div
                key={q._id}
                className={styles.questionCard}
              >

                <div className={styles.questionHeader}>

                  <span className={styles.questionNumber}>
                    {index + 1}
                  </span>

                  <span className={styles.marks}>
                    {q.marks}{" "}
                    {q.marks === 1 ? "mark" : "marks"}
                  </span>

                </div>

                <h2>{q.question}</h2>

                <div className={styles.options}>

                  {q.options.map((opt, oIndex) => {

                    const selected =
                      answers[q._id] === opt;

                    return (
                      <label
                        key={oIndex}
                        className={`${styles.option} ${
                          selected
                            ? styles.selected
                            : ""
                        }`}
                      >

                        <input
                          type="radio"
                          name={q._id}
                          value={opt}
                          checked={selected}
                          onChange={() =>
                            handleAnswerChange(
                              q._id,
                              opt
                            )
                          }
                        />

                        <span className={styles.optionLetter}>
                          {String.fromCharCode(65 + oIndex)}
                        </span>

                        <span className={styles.optionText}>
                          {opt}
                        </span>

                        {selected && (
                          <span className={styles.check}>
                            ✓
                          </span>
                        )}

                      </label>
                    );
                  })}

                </div>

              </div>

            ))}

          </div>

          {/* Submit */}

          <div className={styles.submitArea}>

            <div>
              <strong>
                {answeredCount === totalQuestions
                  ? "All questions answered"
                  : `${totalQuestions - answeredCount} questions remaining`}
              </strong>

              <p>
                Make sure you have reviewed all your answers.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={styles.submitButton}
            >
              {submitting
                ? "Submitting..."
                : "Submit Quiz →"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AttemptQuiz;