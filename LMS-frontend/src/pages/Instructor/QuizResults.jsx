import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

const QuizResults = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/quizzes/${quizId}/results`)
      .then((response) => {
        setResults(response.data.results);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [quizId]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Quiz Results</h1>
      {results.length === 0 ? (
        <p>No one has attempted this quiz yet.</p>
      ) : (
        results.map((r) => (
          <div key={r._id}>
            <p>{r.student?.name} ({r.student?.email})</p>
            <p>Score: {r.score} / {r.totalMarks} ({r.percentage}%)</p>
          </div>
        ))
      )}
    </div>
  );
}

export default QuizResults