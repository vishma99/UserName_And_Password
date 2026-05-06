import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // ඔබ ලොගින් වූ විට localStorage එකේ 'user' හෝ 'isLoggedIn' වැනි දෙයක් සුරැකූ බව සිතමු
  const user = localStorage.getItem("user");

  if (!user) {
    // පරිශීලකයා ලොග් වී නැතිනම් ඔහුව ලොගින් පිටුවට හරවා යවන්න
    return <Navigate to="/login" replace />;
  }

  // පරිශීලකයා ලොග් වී ඇත්නම් අදාළ පිටුව පෙන්වන්න
  return children;
};

export default ProtectedRoute;
