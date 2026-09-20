
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import styles from "./InstructorDashboard.module.css";

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/courses/my/courses")
      .then((response) => {
        setCourses(response.data.courses);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to load courses");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course? This cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/courses/${courseId}`);

      toast.success("Course deleted");

      setCourses((prev) =>
        prev.filter((course) => course._id !== courseId)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Failed to delete course"
      );
    }
  };

  const handlePublish = async (courseId) => {
    try {
      await axiosInstance.put(`/courses/${courseId}/publish`);

      toast.success("Course published!");

      setCourses((prev) =>
        prev.map((course) =>
          course._id === courseId
            ? { ...course, isPublished: true }
            : course
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Publish failed"
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const publishedCourses = courses.filter(
    (course) => course.isPublished
  ).length;

  const draftCourses = courses.filter(
    (course) => !course.isPublished
  ).length;

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <section className={styles.header}>
        <div>
          <span className={styles.eyebrow}>INSTRUCTOR SPACE</span>
          <h1>My Courses</h1>
          <p>
            Create, manage and publish your learning content from one place.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link
            to="/instructor/create-course"
            className={styles.primaryButton}
          >
            <span>+</span>
            Create Course
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            📚
          </div>
          <div>
            <span>Total Courses</span>
            <strong>{courses.length}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            ✓
          </div>
          <div>
            <span>Published</span>
            <strong>{publishedCourses}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            ◷
          </div>
          <div>
            <span>Drafts</span>
            <strong>{draftCourses}</strong>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.quickSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>QUICK ACTIONS</span>
            <h2>Manage Content</h2>
          </div>
        </div>

        <div className={styles.actionGrid}>
          <Link
            to="/instructor/add-lecture"
            className={styles.actionCard}
          >
            <div className={styles.actionIcon}>▶</div>
            <div>
              <h3>Add Lecture</h3>
              <p>Add new learning material to a course.</p>
            </div>
            <span className={styles.arrow}>→</span>
          </Link>

          <Link
            to="/instructor/create-assignment"
            className={styles.actionCard}
          >
            <div className={styles.actionIcon}>✎</div>
            <div>
              <h3>Create Assignment</h3>
              <p>Create tasks and assessments for students.</p>
            </div>
            <span className={styles.arrow}>→</span>
          </Link>

          <Link
            to="/instructor/create-quiz"
            className={styles.actionCard}
          >
            <div className={styles.actionIcon}>?</div>
            <div>
              <h3>Create Quiz</h3>
              <p>Build quizzes to test student knowledge.</p>
            </div>
            <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </section>

      {/* Courses */}
      <section className={styles.coursesSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>YOUR CONTENT</span>
            <h2>Course Library</h2>
          </div>

          <span className={styles.courseCount}>
            {courses.length} {courses.length === 1 ? "Course" : "Courses"}
          </span>
        </div>

        {courses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>

            <h2>No courses yet</h2>

            <p>
              Start creating your first course and share your knowledge
              with students.
            </p>

            <Link
              to="/instructor/create-course"
              className={styles.primaryButton}
            >
              + Create Your First Course
            </Link>
          </div>
        ) : (
          <div className={styles.courseGrid}>
            {courses.map((course) => (
              <article
                key={course._id}
                className={styles.courseCard}
              >
                {/* Thumbnail */}
                <div className={styles.courseVisual}>
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                    />
                  ) : (
                    <div className={styles.thumbnailFallback}>
                      <span>LEARNHUB</span>
                    </div>
                  )}

                  <span
                    className={`${styles.status} ${
                      course.isPublished
                        ? styles.published
                        : styles.draft
                    }`}
                  >
                    {course.isPublished
                      ? "● Published"
                      : "● Draft"}
                  </span>
                </div>

                {/* Content */}
                <div className={styles.courseBody}>
                  <h3>{course.title}</h3>

                  <p className={styles.description}>
                    {course.description ||
                      "No course description available."}
                  </p>

                  <div className={styles.courseActions}>
                    <Link
                      to={`/instructor/course/${course._id}/students`}
                    >
                      Students
                    </Link>

                    <Link
                      to={`/instructor/course/${course._id}/assignments`}
                    >
                      Assignments
                    </Link>

                    <Link
                      to={`/instructor/course/${course._id}/quizzes`}
                    >
                      Quizzes
                    </Link>
                  </div>

                  <div className={styles.bottomActions}>
                    <Link
                      to={`/instructor/course/${course._id}/edit`}
                      className={styles.editButton}
                    >
                      Edit Course
                    </Link>

                    {!course.isPublished && (
                      <button
                        onClick={() => handlePublish(course._id)}
                        className={styles.publishButton}
                      >
                        Publish
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(course._id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default InstructorDashboard;

