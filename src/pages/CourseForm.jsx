//src/pages/CourseForm.jsx
// Create a course (/courses/new) or edit one (/courses/:courseId/edit).

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const STATUS_LIST = ["Open", "Close", "Cancel"];

const emptyForm = {
  name: "",
  duration: "",
  price: "",
  maxStudent: "",
  status: "Open",
  topics: [],
};

export default function CourseForm() {
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const { apiFetch } = useContext(UserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [topicInput, setTopicInput] = useState("");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const result = await apiFetch(`/api/course/${courseId}`);
      if (result.ok) {
        const c = result.data.course;
        setForm({
          name: c.name,
          duration: c.duration,
          price: c.price,
          maxStudent: c.maxStudent,
          status: c.status,
          topics: c.topics,
        });
        setEnrolledCount(c.enrolledCount);
      } else {
        setErrorMsg(result.data.message || "Failed to load course");
      }
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const setField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const addTopics = () => {
    const newTopics = topicInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !form.topics.includes(t));
    if (newTopics.length > 0) {
      setForm((prev) => ({ ...prev, topics: [...prev.topics, ...newTopics] }));
    }
    setTopicInput("");
  };

  const removeTopic = (topic) =>
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t !== topic),
    }));

  const onSubmit = async (event) => {
    event.preventDefault();
    // Include anything still typed in the topic box
    const pending = topicInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !form.topics.includes(t));
    const topics = [...form.topics, ...pending];
    if (topics.length === 0) {
      setErrorMsg("Please add at least one topic");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    const body = {
      name: form.name,
      duration: Number(form.duration),
      price: Number(form.price),
      maxStudent: Number(form.maxStudent),
      status: form.status,
      topics: topics,
    };
    const result = await apiFetch(
      isEdit ? `/api/course/${courseId}` : "/api/course",
      { method: isEdit ? "PUT" : "POST", body },
    );
    setIsSaving(false);
    if (result.ok) {
      navigate(`/courses/${isEdit ? courseId : result.data.id}`);
    } else {
      setErrorMsg(result.data.message || "Save failed");
    }
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Paper sx={{ p: 3, maxWidth: 640, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isEdit ? "Edit Course" : "Create New Course"}
      </Typography>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          required
          label="Course Name"
          value={form.name}
          onChange={setField("name")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            required
            type="number"
            label="Duration (days)"
            value={form.duration}
            onChange={setField("duration")}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
          <TextField
            required
            type="number"
            label="Price"
            value={form.price}
            onChange={setField("price")}
            slotProps={{ htmlInput: { min: 0, step: "any" } }}
          />
          <TextField
            required
            type="number"
            label="Max Student"
            value={form.maxStudent}
            onChange={setField("maxStudent")}
            helperText={
              isEdit && enrolledCount > 0
                ? `At least ${enrolledCount} (already enrolled)`
                : " "
            }
            slotProps={{
              htmlInput: { min: Math.max(enrolledCount, 1), step: 1 },
            }}
          />
        </div>
        <TextField
          select
          label="Status"
          value={form.status}
          onChange={setField("status")}
        >
          {STATUS_LIST.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        <div>
          <div className="flex gap-2">
            <TextField
              fullWidth
              size="small"
              label="Add topic"
              placeholder="Type a topic and press Enter (comma for several)"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTopics();
                }
              }}
            />
            <Button variant="outlined" onClick={addTopics}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {form.topics.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No topics yet
              </Typography>
            )}
            {form.topics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                onDelete={() => removeTopic(topic)}
              />
            ))}
          </div>
        </div>

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <div className="flex gap-2 justify-end">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      </form>
    </Paper>
  );
}
