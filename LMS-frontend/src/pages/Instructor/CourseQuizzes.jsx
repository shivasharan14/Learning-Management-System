import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const CourseQuizzes = () => {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/quizzes/course/${courseId}`)
      .then((response) => {
        setQuizzes(response.data.quizzes);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [courseId]);

  const handlePublishToggle = async (quizId) => {
    try {
      const response = await axiosInstance.put(`/quizzes/${quizId}/publish`);
      toast.success(response.data.msg);

      setQuizzes((prev) =>
        prev.map((q) =>
          q._id === quizId ? { ...q, isPublished: response.data.quiz.isPublished } : q
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to update quiz");
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Course Quizzes</h1>
      {quizzes.length === 0 ? (
        <p>No quizzes created yet.</p>
      ) : (
        quizzes.map((q) => (
          <div key={q._id}>
            <h3>{q.title}</h3>
            <p>Questions: {q.questions.length}, Total Marks: {q.totalMarks}</p>
            <p>Status: {q.isPublished ? "Published ✅" : "Draft"}</p>
            <button onClick={() => handlePublishToggle(q._id)}>
              {q.isPublished ? "Unpublish" : "Publish"}
            </button>
            <Link to={`/instructor/quiz/${q._id}/results`}>View Results</Link>
          </div>
        ))
      )}
    </div>
  );
}

export default CourseQuizzes