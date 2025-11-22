import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";

import ProtectedRoute from "@/components/ProtectedRoutes";

// Dashboard + Layout
import Dashboard from "@/pages/Dashboard";
import DashboardLayout from "@/components/DashboardLayout";

// Product Module Pages
import ProductsList from "@/pages/products/ProductList";
import ProductForm from "@/pages/products/ProductForm";
import ProductDetail from "@/pages/products/ProductDetail";

function App() {
  return (
    <Router>
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- PROTECTED ROUTES ---------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {/* <DashboardLayout> */}
              <Dashboard />
              {/* </DashboardLayout> */}
            </ProtectedRoute>
          }
        />

        {/* PRODUCTS LIST */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              {/* <DashboardLayout> */}
              <ProductsList />
              {/* </DashboardLayout> */}
            </ProtectedRoute>
          }
        />

        {/* CREATE PRODUCT */}
        <Route
          path="/products/create"
          element={
            <ProtectedRoute>

              <ProductForm />

            </ProtectedRoute>
          }
        />

        {/* PRODUCT DETAIL */}
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>

              <ProductDetail />

            </ProtectedRoute>
          }
        />

        {/* PRODUCT EDIT */}
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>

              <ProductForm />

            </ProtectedRoute>
          }
        />

        {/* ---------- DEFAULT ---------- */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
