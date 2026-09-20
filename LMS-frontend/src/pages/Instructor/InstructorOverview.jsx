import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

const InstructorOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/courses/my/overview')
      .then((response) => {
        setOverview(response.data.overview);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!overview) {
    return <h1>Failed to load overview</h1>;
  }

  return (
    <div>
      <h1>Overview</h1>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ border: "1px solid #ccc", padding: "15px", minWidth: "150px" }}>
          <h3>{overview.totalCourses}</h3>
          <p>Total Courses</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "15px", minWidth: "150px" }}>
          <h3>{overview.publishedCourses}</h3>
          <p>Published Courses</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "15px", minWidth: "150px" }}>
          <h3>{overview.totalStudents}</h3>
          <p>Total Students</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "15px", minWidth: "150px" }}>
          <h3>{overview.totalAssignments}</h3>
          <p>Total Assignments</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "15px", minWidth: "150px" }}>
          <h3>{overview.totalQuizzes}</h3>
          <p>Total Quizzes</p>
        </div>

        <div style={{ border: "1px solid orange", padding: "15px", minWidth: "150px" }}>
          <h3>{overview.pendingGrading}</h3>
          <p>Pending Grading</p>
        </div>
      </div>
    </div>
  );
}

export default InstructorOverview