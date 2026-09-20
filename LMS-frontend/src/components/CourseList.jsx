import { Link } from "react-router-dom";
import styles from "./CourseList.module.css";

function CourseList({ id, title, description }) {
  return (
    <article className={styles.card}>

      <div className={styles.imageArea}>
        <div className={styles.courseIcon}>📚</div>

        <span className={styles.badge}>
          Online Course
        </span>
      </div>

      <div className={styles.content}>

        <span className={styles.label}>
          DEVELOPMENT
        </span>

        <h3>{title}</h3>

        <p>
          {description || "Learn practical skills through structured lessons and hands-on learning."}
        </p>

        <div className={styles.info}>
          <span>📖 Structured Learning</span>
          <span>✓ Beginner Friendly</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.access}>
            Learn at your own pace
          </span>

          <Link to={`/courses/${id}`} className={styles.viewButton}>
            View Course
            <span>→</span>
          </Link>
        </div>

      </div>
    </article>
  );
}

export default CourseList;