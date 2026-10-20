//src/pages/CourseList.jsx
// Teacher: own courses. Student: all non-cancelled courses with a filter.

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import CourseTable from "../components/CourseTable";

export default function CourseList() {
  const { user, apiFetch } = useContext(UserContext);
  const isTeacher = user.role === "Teacher";
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let ignore = false;
    // Small delay so we don't call the API on every key press
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const params = query.trim()
        ? `?q=${encodeURIComponent(query.trim())}`
        : "";
      const result = await apiFetch(`/api/course${params}`);
      if (ignore) return;
      if (result.ok) {
        setCourses(result.data.courseList);
        setErrorMsg("");
      } else {
        setErrorMsg(result.data.message || "Failed to load courses");
      }
      setIsLoading(false);
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {isTeacher ? "My Courses" : "All Courses"}
        </Typography>
        <TextField
          size="small"
          placeholder={
            isTeacher ? "Search course name" : "Search course or teacher name"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        {isTeacher && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/courses/new"
          >
            New Course
          </Button>
        )}
      </div>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      {isLoading && <LinearProgress sx={{ mb: 1 }} />}
      <CourseTable
        courses={courses}
        showTeacher={!isTeacher}
        isLoading={isLoading}
        emptyText={
          isTeacher && !query
            ? "You have not created any course yet"
            : "No courses found"
        }
      />
    </div>
  );
}
