import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        dispatch(signInFailure(data.message));
      } else {
        dispatch(signInSuccess(data));
        navigate("/");
      }
    } catch (err) {
      dispatch(signInFailure(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(45deg, #C9B0FD, #EA6B50)",
        color: "#FFFFFF",
      }}
    >
      <div style={{ width: "80%", maxWidth: "500px" }}>
        <h2 className="text-center" style={{ fontSize: "30px" }}>
          Sign In
        </h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validate={(values) => {
            const errors = {};
            if (!values.email) {
              errors.email = "Required";
            }
            if (!values.password) {
              errors.password = "Required";
            }
            return errors;
          }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group mb-2">
                <label htmlFor="email">Email address</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div style={{ display: "grid", flexWrap: "nowrap", gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                  }}
                >
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      fontSize: "1.2rem",
                      backgroundColor: "#007BFF",
                      borderRadius: "10px",
                      width: "100%",
                      background: "linear-gradient(45deg, crimson, yellow)",
                      color: "#FFFFFF",
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
                <OAuth />
              </div>
            </Form>
          )}
        </Formik>
        <div className="flex mt-2">
          <span>Don't Have an account? </span>
          <Link
            to="/sign-up"
            style={{
              textDecoration: "none",
              color: "black",
              fontWeight: "bold",
            }}
          >
            Sign Up
          </Link>
        </div>
        <div
          className="mt-2"
          style={{
            color: "black",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #6a82fb, #fc5c7d)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {errorMessage && <div className="alert">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
}
