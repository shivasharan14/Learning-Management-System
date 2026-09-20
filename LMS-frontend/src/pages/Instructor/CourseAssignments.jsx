import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

const CourseAssignments = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/assignments/course/${courseId}`)
      .then((response) => {
        setAssignments(response.data.assignments);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Course Assignments</h1>
      {assignments.length === 0 ? (
        <p>No assignments created yet.</p>
      ) : (
        assignments.map((a) => (
          <div key={a._id}>
            <h3>{a.title}</h3>
            <p>Due: {new Date(a.dueDate).toLocaleDateString()}</p>
            <Link to={`/instructor/assignment/${a._id}/submissions`}>
              View Submissions
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default CourseAssignments