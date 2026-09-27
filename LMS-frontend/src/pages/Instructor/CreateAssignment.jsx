import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import styles from "./CreateAssignment.module.css";

const CreateAssignment = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const [attachMode, setAttachMode] = useState("none");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("/courses/my/courses")
      .then((response) => {
        setCourses(response.data.courses);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to load courses");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();

    formData.append("course", course);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("totalMarks", totalMarks);

    if (attachMode === "file" && file) {
      formData.append("file", file);
    } else if (attachMode === "link" && link) {
      formData.append("link", link);
    }

    try {
      await axiosInstance.post("/assignments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Assignment created!");

      navigate("/instructor/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Failed to create assignment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourse = courses.find(
    (c) => c._id === course
  );

  return (
    <div className={styles.page}>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.container}>

        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              INSTRUCTOR SPACE
            </span>

            <h1>Create Assignment</h1>

            <p>
              Create meaningful tasks and assessments for your
              students.
            </p>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              navigate("/instructor/dashboard")
            }
          >
            ← Dashboard
          </button>
        </section>


        {/* =====================================================
            MAIN LAYOUT
        ====================================================== */}
        <div className={styles.layout}>

          {/* =================================================
              FORM
          ================================================== */}
          <div className={styles.formCard}>

            <div className={styles.cardHeader}>
              <div className={styles.headerIcon}>
                ✎
              </div>

              <div>
                <h2>Assignment Details</h2>

                <p>
                  Provide the instructions and requirements
                  students need to complete this assignment.
                </p>
              </div>
            </div>


            <form onSubmit={handleSubmit}>

              {/* Course */}
              <div className={styles.field}>
                <label htmlFor="course">
                  Course
                  <span>*</span>
                </label>

                <select
                  id="course"
                  value={course}
                  onChange={(e) =>
                    setCourse(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select a course
                  </option>

                  {courses.map((c) => (
                    <option
                      key={c._id}
                      value={c._id}
                    >
                      {c.title}
                    </option>
                  ))}
                </select>

                <small>
                  Choose the course where this assignment
                  will be added.
                </small>
              </div>


              {/* Title */}
              <div className={styles.field}>
                <label htmlFor="title">
                  Assignment Title
                  <span>*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Build a REST API using Node.js"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                />

                <small>
                  Use a clear title that tells students what
                  the assignment is about.
                </small>
              </div>


              {/* Description */}
              <div className={styles.field}>
                <label htmlFor="description">
                  Instructions & Description
                  <span>*</span>
                </label>

                <textarea
                  id="description"
                  placeholder="Explain the task, requirements, expected output and submission instructions..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  required
                ></textarea>

                <small>
                  Give students everything they need to
                  understand and complete the task.
                </small>
              </div>


              {/* Date + Marks */}
              <div className={styles.twoColumns}>

                <div className={styles.field}>
                  <label htmlFor="dueDate">
                    Due Date
                    <span>*</span>
                  </label>

                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(e.target.value)
                    }
                    required
                  />
                </div>


                <div className={styles.field}>
                  <label htmlFor="totalMarks">
                    Total Marks
                    <span>*</span>
                  </label>

                  <div className={styles.marksInput}>
                    <input
                      id="totalMarks"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={totalMarks}
                      onChange={(e) =>
                        setTotalMarks(e.target.value)
                      }
                      required
                    />

                    <span>Marks</span>
                  </div>
                </div>

              </div>


              {/* Attachment */}
              <div className={styles.attachmentSection}>

                <div className={styles.attachmentHeader}>
                  <div>
                    <h3>
                      Attachment
                      <span>Optional</span>
                    </h3>

                    <p>
                      Provide additional material for
                      students if required.
                    </p>
                  </div>
                </div>


                <div className={styles.attachmentOptions}>

                  {/* None */}
                  <label
                    className={`${styles.attachmentOption} ${
                      attachMode === "none"
                        ? styles.activeOption
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      checked={attachMode === "none"}
                      onChange={() =>
                        setAttachMode("none")
                      }
                    />

                    <span className={styles.optionIcon}>
                      —
                    </span>

                    <span>
                      <strong>No Attachment</strong>
                      <small>
                        Assignment only
                      </small>
                    </span>
                  </label>


                  {/* File */}
                  <label
                    className={`${styles.attachmentOption} ${
                      attachMode === "file"
                        ? styles.activeOption
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      checked={attachMode === "file"}
                      onChange={() =>
                        setAttachMode("file")
                      }
                    />

                    <span className={styles.optionIcon}>
                      ↑
                    </span>

                    <span>
                      <strong>Upload File</strong>
                      <small>
                        PDF, DOC, ZIP, etc.
                      </small>
                    </span>
                  </label>


                  {/* Link */}
                  <label
                    className={`${styles.attachmentOption} ${
                      attachMode === "link"
                        ? styles.activeOption
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      checked={attachMode === "link"}
                      onChange={() =>
                        setAttachMode("link")
                      }
                    />

                    <span className={styles.optionIcon}>
                      ↗
                    </span>

                    <span>
                      <strong>Add Link</strong>
                      <small>
                        External resource
                      </small>
                    </span>
                  </label>

                </div>


                {/* File Upload */}
                {attachMode === "file" && (
                  <div className={styles.uploadBox}>
                    <div className={styles.uploadIcon}>
                      ↑
                    </div>

                    <div className={styles.uploadContent}>
                      <label htmlFor="file">
                        {file
                          ? file.name
                          : "Choose a file to upload"}
                      </label>

                      <small>
                        {file
                          ? `${(
                              file.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : "Select a file from your computer"}
                      </small>
                    </div>

                    <input
                      id="file"
                      type="file"
                      onChange={(e) =>
                        setFile(e.target.files[0])
                      }
                    />
                  </div>
                )}


                {/* Link */}
                {attachMode === "link" && (
                  <div className={styles.linkBox}>
                    <span>↗</span>

                    <input
                      type="url"
                      placeholder="https://example.com/resource"
                      value={link}
                      onChange={(e) =>
                        setLink(e.target.value)
                      }
                    />
                  </div>
                )}

              </div>


              {/* Actions */}
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
                      <span
                        className={styles.spinner}
                      ></span>

                      Creating...
                    </>
                  ) : (
                    <>
                      Create Assignment
                      <span>→</span>
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>


          {/* =================================================
              SIDE PREVIEW
          ================================================== */}
          <aside className={styles.sidePanel}>

            <div className={styles.previewLabel}>
              ASSIGNMENT PREVIEW
            </div>


            <div className={styles.previewCard}>

              <div className={styles.previewTop}>

                <div className={styles.assignmentVisual}>
                  <div className={styles.visualGlow}></div>

                  <span>ASSIGNMENT</span>

                  <div className={styles.visualIcon}>
                    ✎
                  </div>
                </div>

              </div>


              <div className={styles.previewBody}>

                <span className={styles.previewCourse}>
                  {selectedCourse
                    ? selectedCourse.title
                    : "SELECT COURSE"}
                </span>

                <h3>
                  {title ||
                    "Your assignment title will appear here"}
                </h3>

                <p>
                  {description ||
                    "Your assignment instructions will appear here once you start writing."}
                </p>


                <div className={styles.previewMeta}>

                  <div>
                    <span>Due Date</span>

                    <strong>
                      {dueDate || "Not set"}
                    </strong>
                  </div>

                  <div>
                    <span>Total Marks</span>

                    <strong>
                      {totalMarks || "0"}
                    </strong>
                  </div>

                </div>


                {attachMode !== "none" && (
                  <div className={styles.attachmentPreview}>

                    <span>
                      {attachMode === "file"
                        ? "↑"
                        : "↗"}
                    </span>

                    <div>
                      <strong>
                        {attachMode === "file"
                          ? file?.name ||
                            "File attachment"
                          : "External resource"}
                      </strong>

                      <small>
                        {attachMode === "file"
                          ? "Attached file"
                          : link || "Link will appear here"}
                      </small>
                    </div>

                  </div>
                )}

              </div>

            </div>


            {/* Tips */}
            <div className={styles.tips}>

              <div className={styles.tipTitle}>
                <span>✦</span>

                Tips for a great assignment
              </div>

              <ul>
                <li>
                  Write clear and specific instructions.
                </li>

                <li>
                  Set a realistic deadline for students.
                </li>

                <li>
                  Explain how the assignment will be
                  evaluated.
                </li>

                <li>
                  Add helpful resources when necessary.
                </li>
              </ul>

            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;