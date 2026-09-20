import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import styles from "./AddLecture.module.css";

const AddLecture = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  // Video source
  const [videoSource, setVideoSource] = useState("upload");
  const [videoUrl, setVideoUrl] = useState("");

  const [uploading, setUploading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses/my/courses");
        setCourses(response.data.courses || []);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load your courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const getAcceptedTypes = () => {
    switch (type) {
      case "video":
        return ".mp4,.webm,.mov";
      case "pdf":
        return ".pdf";
      case "ppt":
        return ".ppt,.pptx";
      case "material":
        return ".doc,.docx,.txt";
      default:
        return "";
    }
  };

  const getFileTypeText = () => {
    switch (type) {
      case "video":
        return "MP4, WebM or MOV";
      case "pdf":
        return "PDF";
      case "ppt":
        return "PPT or PPTX";
      case "material":
        return "DOC, DOCX or TXT";
      default:
        return "Supported file";
    }
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    const allowedExtensions = {
      video: ["mp4", "webm", "mov"],
      pdf: ["pdf"],
      ppt: ["ppt", "pptx"],
      material: ["doc", "docx", "txt"],
    };

    return allowedExtensions[type]?.includes(extension);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;

    setType(newType);
    setFile(null);
    setVideoUrl("");
    setVideoSource("upload");
  };

  const handleVideoSourceChange = (source) => {
    setVideoSource(source);
    setFile(null);
    setVideoUrl("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!validateFile(selectedFile)) {
      toast.error(`Please select a valid ${type} file.`);
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!course) {
      toast.error("Please select a course");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }

    // ==============================================
    // VIDEO VALIDATION
    // ==============================================

    if (type === "video") {
      if (videoSource === "url") {
        if (!videoUrl.trim()) {
          toast.error("Please enter a video URL");
          return;
        }

        try {
          new URL(videoUrl.trim());
        } catch {
          toast.error("Please enter a valid video URL");
          return;
        }
      } else {
        if (!file) {
          toast.error("Please select a video file");
          return;
        }

        if (!validateFile(file)) {
          toast.error("Please select a valid video file");
          return;
        }
      }
    }

    // ==============================================
    // OTHER FILE TYPES
    // ==============================================

    if (type !== "video") {
      if (!file) {
        toast.error("Please select a lecture file");
        return;
      }

      if (!validateFile(file)) {
        toast.error(`Please select a valid ${type} file.`);
        return;
      }
    }

    const formData = new FormData();

    formData.append("course", course);
    formData.append("title", title.trim());
    formData.append("type", type);
    formData.append("description", description.trim());

    // ==============================================
    // VIDEO URL
    // ==============================================

    if (type === "video" && videoSource === "url") {
      formData.append("videoUrl", videoUrl.trim());
    }

    // ==============================================
    // FILE UPLOAD
    // ==============================================

    if (file) {
      formData.append("file", file);
    }

    setUploading(true);

    try {
      await axiosInstance.post("/lectures", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Lecture created successfully!");

      navigate("/instructor/dashboard");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.msg || "Failed to create lecture"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlowOne}></div>
      <div className={styles.backgroundGlowTwo}></div>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>INSTRUCTOR SPACE</span>

            <h1>Add New Lecture</h1>

            <p>
              Upload a lecture or add a video link to your course.
            </p>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/instructor/dashboard")}
          >
            <span>←</span>
            Dashboard
          </button>
        </header>

        <div className={styles.layout}>
          {/* Form card */}
          <main className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerIcon}>▶</div>

              <div>
                <h2>Lecture Information</h2>

                <p>
                  Add the details and learning material for this lecture.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Course */}
              <div className={styles.field}>
                <label htmlFor="course">
                  Course <span>*</span>
                </label>

                <select
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                  disabled={loadingCourses || uploading}
                >
                  <option value="">
                    {loadingCourses
                      ? "Loading courses..."
                      : "-- Select Course --"}
                  </option>

                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <small>
                  Select the course where this lecture belongs.
                </small>
              </div>

              {/* Title */}
              <div className={styles.field}>
                <label htmlFor="title">
                  Lecture Title <span>*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Introduction to Java"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={uploading}
                />

                <small>
                  Use a clear title that tells students what they will learn.
                </small>
              </div>

              {/* Type */}
              <div className={styles.field}>
                <label htmlFor="type">
                  Lecture Type <span>*</span>
                </label>

                <select
                  id="type"
                  value={type}
                  onChange={handleTypeChange}
                  disabled={uploading}
                >
                  <option value="video">Video Lecture</option>
                  <option value="pdf">PDF Document</option>
                  <option value="ppt">PowerPoint Presentation</option>
                  <option value="material">Study Material</option>
                </select>

                <small>
                  Choose the type of learning material you are adding.
                </small>
              </div>

              {/* Video Source */}
              {type === "video" && (
                <div className={styles.field}>
                  <label>
                    Video Source <span>*</span>
                  </label>

                  <div className={styles.sourceOptions}>
                    <button
                      type="button"
                      className={
                        videoSource === "upload"
                          ? styles.sourceButtonActive
                          : styles.sourceButton
                      }
                      onClick={() =>
                        handleVideoSourceChange("upload")
                      }
                      disabled={uploading}
                    >
                      <span>↑</span>
                      Upload Video
                    </button>

                    <button
                      type="button"
                      className={
                        videoSource === "url"
                          ? styles.sourceButtonActive
                          : styles.sourceButton
                      }
                      onClick={() =>
                        handleVideoSourceChange("url")
                      }
                      disabled={uploading}
                    >
                      <span>🔗</span>
                      Video URL
                    </button>
                  </div>

                  <small>
                    Use an uploaded video or a YouTube, Vimeo, or direct
                    video URL.
                  </small>
                </div>
              )}

              {/* Video URL */}
              {type === "video" && videoSource === "url" && (
                <div className={styles.field}>
                  <label htmlFor="videoUrl">
                    Video URL <span>*</span>
                  </label>

                  <input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={uploading}
                  />

                  <small>
                    Paste your YouTube, Vimeo, or direct video link.
                  </small>
                </div>
              )}

              {/* File */}
              {(type !== "video" || videoSource === "upload") && (
                <div className={styles.field}>
                  <label htmlFor="file">
                    Lecture File <span>*</span>
                  </label>

                  <div className={styles.fileBox}>
                    <div className={styles.uploadIcon}>↑</div>

                    <div className={styles.fileContent}>
                      <strong>
                        {file
                          ? file.name
                          : "Choose your lecture file"}
                      </strong>

                      <span>
                        {file
                          ? `${(file.size / (1024 * 1024)).toFixed(
                              2
                            )} MB`
                          : `Supported format: ${getFileTypeText()}`}
                      </span>
                    </div>

                    <label
                      htmlFor="file"
                      className={styles.chooseButton}
                    >
                      Browse
                    </label>

                    <input
                      id="file"
                      type="file"
                      accept={getAcceptedTypes()}
                      onChange={handleFileChange}
                      disabled={uploading}
                      required={
                        type !== "video" ||
                        videoSource === "upload"
                      }
                    />
                  </div>

                  <small>
                    Select a {getFileTypeText()} file according to
                    the lecture type.
                  </small>
                </div>
              )}

              {/* Notice */}
              <div className={styles.notice}>
                <div className={styles.noticeIcon}>i</div>

                <div>
                  <strong>Before you create the lecture</strong>

                  <p>
                    {type === "video" && videoSource === "url"
                      ? "Make sure the video URL is correct and accessible to your students."
                      : "Make sure you have selected the correct course and lecture type. Your file will be securely uploaded and stored with the lecture."}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() =>
                    navigate("/instructor/dashboard")
                  }
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={uploading || loadingCourses}
                >
                  {uploading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Lecture
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>

          {/* Side panel */}
          <aside className={styles.sidePanel}>
            <span className={styles.previewLabel}>
              LECTURE OVERVIEW
            </span>

            <div className={styles.previewCard}>
              <div className={styles.previewTop}>
                <div className={styles.previewPlay}>▶</div>

                <span>
                  {type === "video"
                    ? "VIDEO"
                    : type === "pdf"
                    ? "PDF"
                    : type === "ppt"
                    ? "PRESENTATION"
                    : "MATERIAL"}
                </span>
              </div>

              <div className={styles.previewBody}>
                <span className={styles.previewType}>
                  {courses.find((c) => c._id === course)?.title ||
                    "SELECT COURSE"}
                </span>

                <h3>
                  {title || "Your lecture title"}
                </h3>

                <p>
                  {description ||
                    "Your lecture description will appear here as you add it."}
                </p>

                <div className={styles.previewDivider}></div>

                <div className={styles.previewMeta}>
                  <span>Type</span>

                  <strong>
                    {type === "video"
                      ? "Video"
                      : type === "pdf"
                      ? "PDF"
                      : type === "ppt"
                      ? "PPT"
                      : "Material"}
                  </strong>
                </div>

                <div className={styles.previewMeta}>
                  <span>Source</span>

                  <strong>
                    {type === "video"
                      ? videoSource === "url"
                        ? "Video URL"
                        : file
                        ? "Uploaded Video ✓"
                        : "Not selected"
                      : file
                      ? "File Selected ✓"
                      : "Not selected"}
                  </strong>
                </div>
              </div>
            </div>

            <div className={styles.tips}>
              <div className={styles.tipHeader}>
                <span>✦</span>
                Tips for a great lecture
              </div>

              <ul>
                <li>Use a short and descriptive lecture title.</li>
                <li>Choose the correct material type.</li>
                <li>Add a useful description for students.</li>
                <li>
                  For videos, you can upload a file or use a video URL.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddLecture;