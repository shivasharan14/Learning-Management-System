import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const CreateAssignment = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const [attachMode, setAttachMode] = useState("none"); // "none", "file", "link"
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance.get('/courses/my/courses')
      .then((response) => setCourses(response.data.courses))
      .catch((error) => console.log(error));
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
      await axiosInstance.post('/assignments', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Assignment created!");
      navigate('/instructor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Assignment</h1>
      <form onSubmit={handleSubmit}>
        <label>Course</label>
        <select value={course} onChange={(e) => setCourse(e.target.value)} required>
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>

        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>

        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />

        <label>Total Marks</label>
        <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} required />

        <label>Attachment (optional)</label>
        <div>
          <label>
            <input type="radio" checked={attachMode === "none"} onChange={() => setAttachMode("none")} />
            None
          </label>
          <label>
            <input type="radio" checked={attachMode === "file"} onChange={() => setAttachMode("file")} />
            Upload File
          </label>
          <label>
            <input type="radio" checked={attachMode === "link"} onChange={() => setAttachMode("link")} />
            Add Link
          </label>
        </div>

        {attachMode === "file" && (
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        )}
        {attachMode === "link" && (
          <input
            type="text"
            placeholder="https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
}

export default CreateAssignment