//src/components/Layout.jsx

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import SchoolIcon from "@mui/icons-material/School";
import { useContext } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Layout() {
  const { user, isLoggedIn, isInitializing, logout } = useContext(UserContext);
  const navigate = useNavigate();

  if (isInitializing) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <CircularProgress />
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const isTeacher = user.role === "Teacher";
  const links = isTeacher
    ? [
        { to: "/courses", label: "My Courses" },
        { to: "/courses/new", label: "New Course" },
      ]
    : [
        { to: "/courses", label: "All Courses" },
        { to: "/my-courses", label: "Enrolled" },
      ];

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <AppBar position="static">
        <Toolbar className="gap-2 flex-wrap">
          <SchoolIcon />
          <Typography variant="h6" sx={{ mr: 2 }}>
            Online Course
          </Typography>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              end
              color="inherit"
              sx={{ "&.active": { textDecoration: "underline" } }}
            >
              {link.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2">{user.username}</Typography>
          <Chip
            size="small"
            label={user.role}
            sx={{ bgcolor: "white", color: "primary.main" }}
          />
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </div>
  );
}
