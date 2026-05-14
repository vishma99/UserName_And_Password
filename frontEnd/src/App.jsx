import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./page/Login";
import Home from "./page/Home";
import Register from "./page/Register";
import Forget from "./page/ForgetPassword";
import VerifyForgetPassword from "./page/VerifyForgetPassword";
import Verify from "./page/Verift";
import ProtectedRoute from "./components/ProtectedRoute";
import MainHome from "./page/MainHome";
import Pc from "./page/Pc";
import Laptop from "./page/Lapto";

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <MainHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pc"
            element={
              <ProtectedRoute>
                <Pc />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laptop"
            element={
              <ProtectedRoute>
                <Laptop />
              </ProtectedRoute>
            }
          />

          <Route path="/register" element={<Register />} />
          <Route path="/forget" element={<Forget />} />
          <Route
            path="/verifyForgetPassword"
            element={<VerifyForgetPassword />}
          />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </Router>
    </>
  );
}
