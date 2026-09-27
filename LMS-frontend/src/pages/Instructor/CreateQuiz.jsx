import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import styles from "./CreateQuiz.module.css";

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", ""],
      correctAnswer: "",
      marks: "",
    },
  ]);

  useEffect(() => {
    axiosInstance
      .get("/courses/my/courses")
      .then((response) => {
        setCourses(response.data.courses);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to load courses");
      });
  }, []);

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", ""],
        correctAnswer: "",
        marks: "",
      },
    ]);
  };

  const removeQuestion = (qIndex) => {
    setQuestions(
      questions.filter((_, index) => index !== qIndex)
    );
  };

  const addOption = (qIndex) => {
    const updated = [...questions];

    updated[qIndex].options.push("");

    setQuestions(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];

    if (updated[qIndex].options.length <= 2) {
      toast.info("A question must have at least 2 options");
      return;
    }

    updated[qIndex].options = updated[qIndex].options.filter(
      (_, index) => index !== oIndex
    );

    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await axiosInstance.post("/quizzes", {
        course,
        title,
        description,
        questions: questions.map((q) => ({
          ...q,
          marks: Number(q.marks),
        })),
      });

      toast.success(
        "Quiz created! (Draft — publish it when ready)"
      );

      navigate("/instructor/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Failed to create quiz"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourse = courses.find(
    (c) => c._id === course
  );

  const totalMarks = questions.reduce(
    (total, q) => total + (Number(q.marks) || 0),
    0
  );

  return (
    <div className={styles.page}>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.container}>

        {/* HEADER */}
        <section className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              INSTRUCTOR SPACE
            </span>

            <h1>Create Quiz</h1>

            <p>
              Build engaging quizzes to test your students'
              knowledge and understanding.
            </p>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              navigate("/instructor/dashboard")
            }
          >
            ← Dashboard
          </button>
        </section>

        {/* MAIN LAYOUT */}
        <div className={styles.layout}>

          {/* LEFT FORM */}
          <div className={styles.formCard}>

            {/* QUIZ DETAILS */}
            <div className={styles.cardHeader}>
              <div className={styles.headerIcon}>
                ?
              </div>

              <div>
                <h2>Quiz Details</h2>

                <p>
                  Set up the basic information for your quiz.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              {/* COURSE */}
              <div className={styles.field}>
                <label htmlFor="course">
                  Course
                  <span>*</span>
                </label>

                <select
                  id="course"
                  value={course}
                  onChange={(e) =>
                    setCourse(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select a course
                  </option>

                  {courses.map((c) => (
                    <option
                      key={c._id}
                      value={c._id}
                    >
                      {c.title}
                    </option>
                  ))}
                </select>

                <small>
                  Choose the course where this quiz
                  will be added.
                </small>
              </div>

              {/* TITLE */}
              <div className={styles.field}>
                <label htmlFor="title">
                  Quiz Title
                  <span>*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="e.g. JavaScript Fundamentals Quiz"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                />

                <small>
                  Give your quiz a clear and meaningful
                  title.
                </small>
              </div>

              {/* DESCRIPTION */}
              <div className={styles.field}>
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  placeholder="Explain what this quiz covers and what students should prepare for..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                ></textarea>

                <small>
                  Optional information students should
                  know before attempting the quiz.
                </small>
              </div>

              {/* QUESTIONS HEADER */}
              <div className={styles.questionsHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>
                    QUIZ CONTENT
                  </span>

                  <h2>Questions</h2>

                  <p>
                    Add questions, options, correct
                    answers and marks.
                  </p>
                </div>

                <div className={styles.questionCount}>
                  <strong>
                    {questions.length}
                  </strong>

                  <span>
                    {questions.length === 1
                      ? "Question"
                      : "Questions"}
                  </span>
                </div>
              </div>

              {/* QUESTIONS */}
              <div className={styles.questionsList}>
                {questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className={styles.questionCard}
                  >

                    {/* QUESTION TOP */}
                    <div className={styles.questionTop}>
                      <div className={styles.questionNumber}>
                        {String(qIndex + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <span className={styles.questionLabel}>
                          QUESTION {qIndex + 1}
                        </span>

                        <h3>
                          {q.question ||
                            "Untitled question"}
                        </h3>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeQuestion}
                          onClick={() =>
                            removeQuestion(qIndex)
                          }
                          title="Remove question"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* QUESTION TEXT */}
                    <div className={styles.field}>
                      <label
                        htmlFor={`question-${qIndex}`}
                      >
                        Question
                        <span>*</span>
                      </label>

                      <input
                        id={`question-${qIndex}`}
                        type="text"
                        placeholder="e.g. Which technology is used to build the backend?"
                        value={q.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "question",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    {/* OPTIONS */}
                    <div className={styles.optionsSection}>

                      <div className={styles.optionsHeader}>
                        <div>
                          <label>
                            Answer Options
                            <span>*</span>
                          </label>

                          <small>
                            Add at least two possible answers.
                          </small>
                        </div>

                        <span>
                          {q.options.length} options
                        </span>
                      </div>

                      <div className={styles.optionsList}>
                        {q.options.map(
                          (opt, oIndex) => (
                            <div
                              key={oIndex}
                              className={
                                styles.optionRow
                              }
                            >
                              <div
                                className={
                                  styles.optionLetter
                                }
                              >
                                {String.fromCharCode(
                                  65 + oIndex
                                )}
                              </div>

                              <input
                                type="text"
                                placeholder={`Option ${
                                  oIndex + 1
                                }`}
                                value={opt}
                                onChange={(e) =>
                                  handleOptionChange(
                                    qIndex,
                                    oIndex,
                                    e.target.value
                                  )
                                }
                                required
                              />

                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  className={
                                    styles.removeOption
                                  }
                                  onClick={() =>
                                    removeOption(
                                      qIndex,
                                      oIndex
                                    )
                                  }
                                  title="Remove option"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        className={styles.addOption}
                        onClick={() =>
                          addOption(qIndex)
                        }
                      >
                        <span>+</span>
                        Add Option
                      </button>
                    </div>

                    {/* ANSWER + MARKS */}
                    <div className={styles.answerGrid}>

                      <div className={styles.field}>
                        <label
                          htmlFor={`answer-${qIndex}`}
                        >
                          Correct Answer
                          <span>*</span>
                        </label>

                        <input
                          id={`answer-${qIndex}`}
                          type="text"
                          placeholder="Enter the exact correct option"
                          value={q.correctAnswer}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                          required
                        />

                        <small>
                          Must exactly match one of the
                          options above.
                        </small>
                      </div>

                      <div className={styles.field}>
                        <label
                          htmlFor={`marks-${qIndex}`}
                        >
                          Marks
                          <span>*</span>
                        </label>

                        <div
                          className={
                            styles.marksInput
                          }
                        >
                          <input
                            id={`marks-${qIndex}`}
                            type="number"
                            min="1"
                            placeholder="10"
                            value={q.marks}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "marks",
                                e.target.value
                              )
                            }
                            required
                          />

                          <span>Marks</span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* ADD QUESTION */}
              <button
                type="button"
                className={styles.addQuestion}
                onClick={addQuestion}
              >
                <span>+</span>

                <div>
                  <strong>Add Another Question</strong>

                  <small>
                    Continue building your quiz
                  </small>
                </div>

                <b>→</b>
              </button>

              {/* FORM ACTIONS */}
              <div className={styles.formActions}>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() =>
                    navigate("/instructor/dashboard")
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className={styles.spinner}
                      ></span>

                      Creating...
                    </>
                  ) : (
                    <>
                      Create Quiz
                      <span>→</span>
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>

          {/* RIGHT SIDE */}
          <aside className={styles.sidePanel}>

            <div className={styles.previewLabel}>
              QUIZ PREVIEW
            </div>

            <div className={styles.previewCard}>

              {/* PREVIEW HERO */}
              <div className={styles.previewTop}>
                <div className={styles.previewGlow}></div>

                <span className={styles.previewSmall}>
                  QUIZ
                </span>

                <div className={styles.previewIcon}>
                  ?
                </div>

                <span className={styles.previewStatus}>
                  DRAFT
                </span>
              </div>

              {/* PREVIEW BODY */}
              <div className={styles.previewBody}>

                <span className={styles.previewCourse}>
                  {selectedCourse
                    ? selectedCourse.title
                    : "SELECT COURSE"}
                </span>

                <h3>
                  {title ||
                    "Your quiz title will appear here"}
                </h3>

                <p>
                  {description ||
                    "Your quiz description will appear here once you start writing."}
                </p>

                <div className={styles.previewStats}>

                  <div>
                    <strong>
                      {questions.length}
                    </strong>

                    <span>Questions</span>
                  </div>

                  <div>
                    <strong>
                      {totalMarks}
                    </strong>

                    <span>Total Marks</span>
                  </div>

                </div>

                {/* QUESTION PREVIEW */}
                <div className={styles.questionPreview}>

                  <div className={styles.questionPreviewHeader}>
                    <span>
                      QUESTION 01
                    </span>

                    <strong>
                      {questions[0]?.marks || "0"} marks
                    </strong>
                  </div>

                  <h4>
                    {questions[0]?.question ||
                      "Your first question will appear here"}
                  </h4>

                  <div className={styles.previewOptions}>
                    {(
                      questions[0]?.options || [
                        "",
                        "",
                      ]
                    ).slice(0, 4).map(
                      (option, index) => (
                        <div
                          key={index}
                          className={
                            styles.previewOption
                          }
                        >
                          <span>
                            {String.fromCharCode(
                              65 + index
                            )}
                          </span>

                          <p>
                            {option ||
                              `Option ${index + 1}`}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* QUIZ SUMMARY */}
            <div className={styles.summaryCard}>

              <div className={styles.summaryHeader}>
                <div className={styles.summaryIcon}>
                  ✓
                </div>

                <div>
                  <h3>Quiz Summary</h3>

                  <p>
                    Quick overview of your quiz.
                  </p>
                </div>
              </div>

              <div className={styles.summaryRows}>

                <div>
                  <span>Questions</span>
                  <strong>
                    {questions.length}
                  </strong>
                </div>

                <div>
                  <span>Total Marks</span>
                  <strong>
                    {totalMarks}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>Draft</strong>
                </div>

              </div>
            </div>

            {/* TIPS */}
            <div className={styles.tips}>

              <div className={styles.tipTitle}>
                <span>✦</span>

                Tips for a great quiz
              </div>

              <ul>
                <li>
                  Keep questions clear and specific.
                </li>

                <li>
                  Add believable distractor options.
                </li>

                <li>
                  Make sure the correct answer exactly
                  matches an option.
                </li>

                <li>
                  Balance the marks according to
                  difficulty.
                </li>
              </ul>

            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;