import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

const EnrolledStudents = () => {
  const { courseId } = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/enrollments/course/${courseId}`)
      .then((response) => {
        setStudents(response.data.enrollments);
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
      <h1>Enrolled Students</h1>
      {students.length === 0 ? (
        <p>No students enrolled yet.</p>
      ) : (
        students.map((enrollment) => (
          <div key={enrollment._id}>
            <p>{enrollment.student?.name} ({enrollment.student?.email})</p>
          </div>
        ))
      )}
    </div>
  );
}

export default EnrolledStudents