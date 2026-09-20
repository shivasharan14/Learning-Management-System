import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminCourses.module.css";

const formatPrice = (price) => {
  if (price === undefined || price === null || price === "") return "—";
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  if (num === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/admin/courses")
      .then((response) => {
        setCourses(response.data.courses);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const toggleCoursePublish = async (courseId) => {
    setPendingId(courseId);
    try {
      const response = await axiosInstance.put(
        `/admin/courses/${courseId}/publish`
      );

      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course._id === courseId
            ? { ...course, isPublished: response.data.course.isPublished }
            : course
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setPendingId(null);
    }
  };

  const deleteCourse = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;

    setPendingId(courseId);
    try {
      await axiosInstance.delete(`/admin/courses/${courseId}`);
      setCourses((currentCourses) =>
        currentCourses.filter((course) => course._id !== courseId)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Course management</h1>
          <p className={styles.subtitle}>
            {loading
              ? "Loading courses…"
              : `${courses.length} course${courses.length === 1 ? "" : "s"} total`}
          </p>
        </div>
      </header>

      {loading ? (
        <div className={styles.list}>
          {[...Array(4)].map((_, i) => (
            <div className={styles.skeletonRow} key={i}>
              <div className={styles.skeletonBlock} style={{ width: "40%" }} />
              <div className={styles.skeletonBlock} style={{ width: "18%" }} />
              <div className={styles.skeletonBlock} style={{ width: "12%" }} />
              <div className={styles.skeletonBlock} style={{ width: "10%" }} />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No courses yet</p>
          <p className={styles.emptyText}>
            Courses created by instructors will show up here for review and
            publishing.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.listHead} aria-hidden="true">
            <span>Course</span>
            <span>Instructor</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span className={styles.actionsHead}>Actions</span>
          </div>

          {courses.map((course) => {
            const isBusy = pendingId === course._id;
            return (
              <div className={styles.row} key={course._id}>
                <div className={styles.courseCell}>
                  <span className={styles.courseTitle}>{course.title}</span>
                </div>
                <span className={styles.cell}>
                  {course.instructor?.name || "—"}
                </span>
                <span className={styles.cell}>
                  {course.category?.name || "—"}
                </span>
                <span className={styles.cell}>{formatPrice(course.price)}</span>

                <span className={styles.cell}>
                  <span
                    className={`${styles.statusPill} ${
                      course.isPublished ? styles.statusLive : styles.statusDraft
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </span>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => toggleCoursePublish(course._id)}
                    disabled={isBusy}
                  >
                    {course.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => deleteCourse(course._id, course.title)}
                    disabled={isBusy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;