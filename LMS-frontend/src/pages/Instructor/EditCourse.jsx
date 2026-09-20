import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance.get('/categories')
      .then((response) => setCategories(response.data.categories))
      .catch((error) => console.log(error));

    axiosInstance.get(`/courses/${courseId}`)
      .then((response) => {
        const course = response.data.course;
        setTitle(course.title);
        setDescription(course.description);
        setPrice(course.price);
        setCategory(course.category?._id || "");
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axiosInstance.put(`/courses/${courseId}`, {
        title,
        description,
        price: Number(price),
        category,
      });
      toast.success("Course updated!");
      navigate('/instructor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.msg || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Edit Course</h1>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>

        <label>Price (₹)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />

        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">-- निवडा --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Update Course"}
        </button>
      </form>
    </div>
  );
}

export default EditCourse