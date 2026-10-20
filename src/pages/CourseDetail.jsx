//src/pages/CourseDetail.jsx

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";
import { formatPrice } from "../lib/format";

function InfoItem({ label, children }) {
  return (
    <div>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <div className="text-base">{children}</div>
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user, apiFetch } = useContext(UserContext);
  const navigate = useNavigate();
  const isTeacher = user.role === "Teacher";

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionMsg, setActionMsg] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function applyCourseResult(result) {
    if (result.ok) {
      setCourse(result.data.course);
      setErrorMsg("");
    } else {
      setErrorMsg(result.data.message || "Failed to load course");
    }
    setIsLoading(false);
  }

  async function loadCourse() {
    applyCourseResult(await apiFetch(`/api/course/${courseId}`));
  }

  useEffect(() => {
    apiFetch(`/api/course/${courseId}`).then(applyCourseResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const onEnroll = async () => {
    setIsWorking(true);
    const result = await apiFetch(`/api/course/${courseId}/enroll`, {
      method: "POST",
    });
    setActionMsg({
      severity: result.ok ? "success" : "error",
      text: result.ok
        ? "You are now enrolled in this course"
        : result.data.message || "Enroll failed",
    });
    await loadCourse();
    setIsWorking(false);
  };

  const onDelete = async () => {
    setConfirmDelete(false);
    setIsWorking(true);
    const result = await apiFetch(`/api/course/${courseId}`, {
      method: "DELETE",
    });
    setIsWorking(false);
    if (result.ok) {
      navigate("/courses");
    } else {
      setActionMsg({
        severity: "error",
        text: result.data.message || "Delete failed",
      });
    }
  };

  if (isLoading) return <LinearProgress />;
  if (errorMsg) {
    return (
      <div>
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} component={Link} to="/courses">
          Back to courses
        </Button>
      </div>
    );
  }

  const canEnroll =
    course.status === "Open" && course.seatsLeft > 0 && !course.isEnrolled;
  let enrollHint = "";
  if (course.isEnrolled) enrollHint = "You are already enrolled";
  else if (course.status === "Close") enrollHint = "This course is closed for enrollment";
  else if (course.status === "Cancel") enrollHint = "This course has been cancelled";
  else if (course.seatsLeft <= 0) enrollHint = "This course is full";

  return (
    <div>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <div className="grow">
            <Typography variant="h5">{course.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              by {course.teacherName}
            </Typography>
          </div>
          <StatusChip status={course.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <InfoItem label="Duration">{course.duration} days</InfoItem>
          <InfoItem label="Price">{formatPrice(course.price)}</InfoItem>
          <InfoItem label="Max Student">{course.maxStudent}</InfoItem>
          <InfoItem label="Enrolled / Seats left">
            {course.enrolledCount} / {course.seatsLeft}
          </InfoItem>
        </div>

        <InfoItem label="Topics">
          <div className="flex flex-wrap gap-1 mt-1">
            {course.topics.map((topic) => (
              <Chip key={topic} label={topic} size="small" variant="outlined" />
            ))}
          </div>
        </InfoItem>

        {actionMsg && (
          <Alert severity={actionMsg.severity} sx={{ mt: 3 }}>
            {actionMsg.text}
          </Alert>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {isTeacher ? (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                component={Link}
                to={`/courses/${course._id}/edit`}
              >
                Edit
              </Button>
              <Tooltip
                title={
                  course.enrolledCount > 0
                    ? "A course with enrolled students cannot be deleted"
                    : ""
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    disabled={course.enrolledCount > 0 || isWorking}
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </Button>
                </span>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                disabled={!canEnroll || isWorking}
                onClick={onEnroll}
              >
                {course.isEnrolled ? "Enrolled" : "Enroll"}
              </Button>
              {enrollHint && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ alignSelf: "center" }}
                >
                  {enrollHint}
                </Typography>
              )}
            </>
          )}
        </div>
      </Paper>

      {isTeacher && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Enrolled Students ({course.students.length})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Enrolled At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {course.students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No students enrolled yet
                  </TableCell>
                </TableRow>
              )}
              {course.students.map((student, index) => (
                <TableRow key={student.studentId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {new Date(student.enrolledAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete course?</DialogTitle>
        <DialogContent>
          "{course.name}" will be permanently deleted.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" onClick={onDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
