import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./MyProgress.module.css";

const MyProgress = () => {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/progress/my")
      .then((response) => {
        setProgressList(response.data.progress);
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Progress</h1>

      {progressList.length === 0 ? (
        <p className={styles.empty}>
          No progress yet — start a course!
        </p>
      ) : (
        <div className={styles.progressList}>
          {progressList.map((p) => (
            <div className={styles.card} key={p._id}>
              <h3>{p.course?.title}</h3>

              <p className={styles.percentage}>
                {p.progressPercentage}% completed
              </p>

              <div className={styles.progressBar}>
                <div
                  className={`${styles.progress} ${
                    p.completed
                      ? styles.completed
                      : styles.inProgress
                  }`}
                  style={{
                    width: `${p.progressPercentage}%`,
                  }}
                ></div>
              </div>

              {p.completed && (
                <p className={styles.completedText}>
                  🎉 Course Completed!
                </p>
              )}

              <Link
                className={styles.link}
                to={`/courses/${p.course?._id}`}
              >
                Go to Course
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProgress;