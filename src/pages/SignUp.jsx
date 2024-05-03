import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setErrorMessage(null);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message);
      } else {
        navigate("/sign-in");
      }
    } catch (err) {
      setErrorMessage(err.message);
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
        <h2 className="text-center" style={{ fontSize: "27px" }}>
          Sign Up
        </h2>
        <Formik
          initialValues={{ username: "", email: "", password: "" }}
          validate={(values) => {
            const errors = {};
            if (!values.username) {
              errors.username = "Required";
            }
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
                <label htmlFor="username">Username</label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  placeholder="Username"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-danger"
                />
              </div>
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
              <div style={{ display: "grid", flexWrap: "nowrap", gap: "5px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                  }}
                >
                  <button
                    type="submit"
                    className="btn btn-primary"
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
                      "Sign Up"
                    )}
                  </button>
                </div>
                <OAuth />
              </div>
            </Form>
          )}
        </Formik>
        <div className="flex mt-2">
          <span>Have an account? </span>
          <Link
            to="/sign-in"
            style={{
              textDecoration: "none",
              color: "black",
              fontWeight: "bold",
            }}
          >
            Sign In
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
