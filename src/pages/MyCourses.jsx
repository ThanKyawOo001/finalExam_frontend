//src/pages/MyCourses.jsx
// Courses the logged-in student is enrolled in.

import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import CourseTable from "../components/CourseTable";

export default function MyCourses() {
  const { apiFetch } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      const result = await apiFetch("/api/course?enrolled=true");
      if (ignore) return;
      if (result.ok) setCourses(result.data.courseList);
      else setErrorMsg(result.data.message || "Failed to load courses");
      setIsLoading(false);
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Enrolled Courses
      </Typography>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      {isLoading ? (
        <LinearProgress />
      ) : (
        <CourseTable
          courses={courses}
          showTeacher
          emptyText="You have not enrolled in any course yet"
        />
      )}
    </div>
  );
}
