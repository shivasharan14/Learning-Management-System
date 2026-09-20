import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [questions, setQuestions] = useState([
    { question: "", options: ["", ""], correctAnswer: "", marks: "" }
  ]);

  useEffect(() => {
    axiosInstance.get('/courses/my/courses')
      .then((response) => setCourses(response.data.courses))
      .catch((error) => console.log(error));
  }, []);

  // प्रश्नाचा text किंवा marks बदलणे
  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  // एका प्रश्नाच्या एका option चा text बदलणे
  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  // नवीन रिकामा प्रश्न यादीत जोडणे
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", ""], correctAnswer: "", marks: "" }
    ]);
  };

  // एक प्रश्न काढून टाकणे
  const removeQuestion = (qIndex) => {
    setQuestions(questions.filter((_, index) => index !== qIndex));
  };

  // त्या प्रश्नाला अजून एक option जोडणे
  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axiosInstance.post('/quizzes', {
        course,
        title,
        description,
        questions: questions.map((q) => ({
          ...q,
          marks: Number(q.marks),
        })),
      });
      toast.success("Quiz created! (Draft — publish it when ready)");
      navigate('/instructor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to create quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Quiz</h1>
      <form onSubmit={handleSubmit}>
        <label>Course</label>
        <select value={course} onChange={(e) => setCourse(e.target.value)} required>
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>

        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

        <h2>Questions</h2>
        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <label>Question {qIndex + 1}</label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
              required
            />

            <label>Options</label>
            {q.options.map((opt, oIndex) => (
              <input
                key={oIndex}
                type="text"
                placeholder={`Option ${oIndex + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                required
              />
            ))}
            <button type="button" onClick={() => addOption(qIndex)}>+ Add Option</button>

            <label>Correct Answer (exactly matching one option)</label>
            <input
              type="text"
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
              required
            />

            <label>Marks</label>
            <input
              type="number"
              value={q.marks}
              onChange={(e) => handleQuestionChange(qIndex, "marks", e.target.value)}
              required
            />

            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qIndex)}>Remove Question</button>
            )}
          </div>
        ))}

        <button type="button" onClick={addQuestion}>+ Add Question</button>
        <br />
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Quiz"}
        </button>
      </form>
    </div>
  );
}

export default CreateQuiz