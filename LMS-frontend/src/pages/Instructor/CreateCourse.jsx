
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import styles from "./CreateCourse.module.css";

const CreateCourse = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((response) => {
        setCategories(response.data.categories);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to load categories");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axiosInstance.post("/courses", {
        title,
        description,
        price: Number(price),
        category,
      });

      toast.success(
        "Course created! (still in Draft, publish it from Dashboard)"
      );

      navigate("/instructor/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Failed to create course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>INSTRUCTOR SPACE</span>

            <h1>Create New Course</h1>

            <p>
              Turn your knowledge into an engaging learning experience.
            </p>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/instructor/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {/* Main Layout */}
        <div className={styles.layout}>
          {/* Form */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerIcon}>✦</div>

              <div>
                <h2>Course Information</h2>
                <p>Tell students what your course is about.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className={styles.field}>
                <label htmlFor="title">
                  Course Title
                  <span>*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Complete MERN Stack Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <small>
                  Choose a clear and attractive title.
                </small>
              </div>

              {/* Description */}
              <div className={styles.field}>
                <label htmlFor="description">
                  Course Description
                  <span>*</span>
                </label>

                <textarea
                  id="description"
                  placeholder="Explain what students will learn in this course..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>

                <small>
                  Give students a quick overview of the course.
                </small>
              </div>

              {/* Two columns */}
              <div className={styles.twoColumns}>
                <div className={styles.field}>
                  <label htmlFor="price">
                    Course Price <span>*</span>
                  </label>

                  <div className={styles.priceInput}>
                    <span>₹</span>

                    <input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="category">
                    Category <span>*</span>
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notice */}
              <div className={styles.notice}>
                <div className={styles.noticeIcon}>i</div>

                <div>
                  <strong>Course will start as a Draft</strong>

                  <p>
                    After creating the course, you can add lectures,
                    assignments and quizzes. Publish it from your dashboard
                    when it is ready.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() =>
                    navigate("/instructor/dashboard")
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className={styles.spinner}></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Course
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview / Side panel */}
          <aside className={styles.sidePanel}>
            <div className={styles.previewLabel}>
              COURSE PREVIEW
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewImage}>
                <div className={styles.previewGlow}></div>

                <span>LEARNHUB</span>

                <div className={styles.previewPlay}>▶</div>
              </div>

              <div className={styles.previewBody}>
                <span className={styles.previewCategory}>
                  {category
                    ? categories.find(
                        (cat) => cat._id === category
                      )?.name || "Course"
                    : "COURSE"}
                </span>

                <h3>
                  {title || "Your course title will appear here"}
                </h3>

                <p>
                  {description ||
                    "Add a description to give students an idea of what they will learn."}
                </p>

                <div className={styles.previewFooter}>
                  <strong>
                    ₹{price || "0"}
                  </strong>

                  <span>Draft</span>
                </div>
              </div>
            </div>

            <div className={styles.tips}>
              <div className={styles.tipTitle}>
                <span>✦</span>
                Tips for a great course
              </div>

              <ul>
                <li>Use a specific and engaging title.</li>
                <li>Clearly explain what students will learn.</li>
                <li>Keep your course content structured.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;

