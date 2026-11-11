
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

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

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

  // Preview URL cleanup
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  // Handle image selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP and GIF images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // Remove selected image
  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview("");

    const fileInput = document.getElementById("thumbnail");
    if (fileInput) fileInput.value = "";
  };

  // Create course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", String(Number(price)));
      formData.append("category", category);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await axiosInstance.post("/courses", formData);

      toast.success(
        "Course created! (still in Draft, publish it from Dashboard)"
      );

      navigate("/instructor/dashboard");
    } catch (error) {
      console.log(error);
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

        <div className={styles.layout}>
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerIcon}>✦</div>
              <div>
                <h2>Course Information</h2>
                <p>Tell students what your course is about.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="title">
                  Course Title<span>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Complete MERN Stack Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <small>Choose a clear and attractive title.</small>
              </div>

              <div className={styles.field}>
                <label htmlFor="description">
                  Course Description<span>*</span>
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

              {/* Course Thumbnail Upload */}
              <div className={styles.imageUploadBox}>
                <div className={styles.field}>
                  <label htmlFor="thumbnail">Course Thumbnail</label>

                  <label
                    className={styles.uploadArea}
                    htmlFor="thumbnail"
                  >
                    <span className={styles.uploadIcon}>🖼️</span>
                    <strong>Click to upload course image</strong>
                    <small>JPG, PNG, WEBP or GIF (Max 5MB)</small>
                  </label>

                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={styles.fileInput}
                    onChange={handleThumbnailChange}
                  />

                  {thumbnailPreview && (
                    <>
                      <img
                        src={thumbnailPreview}
                        alt="Selected course thumbnail"
                        className={styles.imagePreview}
                      />

                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={removeThumbnail}
                      >
                        Remove Image
                      </button>
                    </>
                  )}
                </div>
              </div>

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

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => navigate("/instructor/dashboard")}
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
                      Create Course<span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Course Preview */}
          <aside className={styles.sidePanel}>
            <div className={styles.previewLabel}>COURSE PREVIEW</div>

            <div className={styles.previewCard}>
              <div className={styles.previewImage}>
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Course preview"
                    className={styles.previewUploadedImage}
                  />
                ) : (
                  <>
                    <div className={styles.previewGlow}></div>
                    <span>LEARNHUB</span>
                    <div className={styles.previewPlay}>▶</div>
                  </>
                )}
              </div>

              <div className={styles.previewBody}>
                <span className={styles.previewCategory}>
                  {category
                    ? categories.find((cat) => cat._id === category)?.name ||
                      "Course"
                    : "COURSE"}
                </span>

                <h3>{title || "Your course title will appear here"}</h3>

                <p>
                  {description ||
                    "Add a description to give students an idea of what they will learn."}
                </p>

                <div className={styles.previewFooter}>
                  <strong>₹{price || "0"}</strong>
                  <span>Draft</span>
                </div>
              </div>
            </div>

            <div className={styles.tips}>
              <div className={styles.tipTitle}>
                <span>✦</span>Tips for a great course
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
