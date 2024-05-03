import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { Alert, styled } from "@mui/material";
import { Button, Modal } from "flowbite-react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  updateFailure,
  updateStart,
  updateSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signoutSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";

export default function Profile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const filePickerRef = useRef();
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSucess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploadError(null);
    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError("File must be less than 2MB");
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSucess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSucess("User Profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  };
  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };
  const handleSignout = async () => {
    try {
      const res = await fetch("api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      className="vh-100"
      style={{
        background: "linear-gradient(45deg, #C9B0FD, #EA6B50)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "20px 0",
      }}
    >
      <h1
        style={{
          fontSize: "30px",
          textAlign: "center",
        }}
      >
        Profile
      </h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={filePickerRef}
        hidden
      />
      <div
        className="profile-image-container"
        style={{
          width: "100px",
          height: "100px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "10px",
          position: "relative",
        }}
        onClick={() => filePickerRef.current.click()}
      >
        {imageFileUploadProgress && (
          <CircularProgressbar
            value={imageFileUploadProgress || 0}
            text={`${imageFileUploadProgress}%`}
            strokeWidth={5}
            styles={{
              root: {
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              },
              path: {
                stroke: `rgba(62,152,199, ${imageFileUploadProgress / 100})`,
              },
            }}
          />
        )}
        <img
          src={imageFileUrl || currentUser.profilePicture}
          alt="user"
          className={`${
            imageFileUploadProgress && imageFileUploadProgress < 100 && styled
          }`}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "4px solid #A4F0DD ",
            outline: "2px solid ",
            cursor: "pointer",
          }}
        />
      </div>
      {imageFileUploadError && (
        <Alert
          style={{
            backgroundColor: "red",
            color: "white",
            marginBottom: "7px",
            padding: "1px",
          }}
          showIcon={false}
        >
          {imageFileUploadError}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column align-items-center"
        style={{ width: "100%" }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: "500px",
          }}
        >
          <div className="form-group mb-4">
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="username"
              defaultValue={currentUser.username}
              onChange={handleChange}
              style={{
                fontSize: "16px",
                height: "30px",
                padding: "10px 20px",
                width: "100%",
              }}
            />
          </div>
          <div className="form-group mb-4">
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="email"
              defaultValue={currentUser.email}
              onChange={handleChange}
              style={{
                fontSize: "16px",
                height: "30px",
                padding: "10px 20px",
                width: "100%",
              }}
            />
          </div>
          <div className="form-group mb-4">
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="*******"
              onChange={handleChange}
              style={{
                fontSize: "16px",
                height: "30px",
                padding: "10px 20px",
                width: "100%",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <button
              type="submit"
              className="btn"
              disabled={loading || imageFileUploading}
              style={{
                fontSize: "1.2rem",

                backgroundColor: "#007BFF",
                borderRadius: "10px",
                width: "350px",
                background: "linear-gradient(45deg, #9289F0 , #2F799A )",
                color: "#FFFFFF",
              }}
            >
              {loading ? "loading" : "Update"}
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                fontSize: "1.2rem",

                backgroundColor: "#007BFF",
                borderRadius: "10px",
                width: "350px",
                background: "linear-gradient(45deg, #07B139 , #B05CC8)",
                color: "#FFFFFF",
              }}
            >
              <Link to="/create-post">Create Post</Link>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
              color: "black",
              fontWeight: "bold",
            }}
          >
            <span
              onClick={() => setShowModal(true)}
              style={{
                cursor: "pointer",
              }}
            >
              Delete Account
            </span>
            <span
              style={{
                cursor: "pointer",
              }}
              onClick={handleSignout}
            >
              Sign Out
            </span>
          </div>
          {updateUserSuccess && (
            <Alert
              style={{
                color: "white",
                marginBottom: "7px",
                padding: "1px",
                background: "linear-gradient(45deg, #9289F0 , #2F799A )",
              }}
              showIcon={false}
            >
              {updateUserSuccess}
            </Alert>
          )}
          {updateUserError && (
            <Alert
              style={{
                marginBottom: "7px",
                padding: "1px",
                background: "linear-gradient(45deg, purple , gold)",
                color: "#FFFFFF",
              }}
              showIcon={false}
            >
              {updateUserError}
            </Alert>
          )}
          {error && (
            <Alert
              style={{
                marginBottom: "7px",
                padding: "1px",
                background: "linear-gradient(45deg, purple , gold)",
                color: "#FFFFFF",
              }}
              showIcon={false}
            >
              {error}
            </Alert>
          )}
        </div>
      </form>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
        style={{
          margin: " auto",
          width: "495px",
        }}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center  " style={{ height: "150px" }}>
            <HiOutlineExclamationCircle
              className="h-14 w-14 text-gray-400 dark:text-gray-200
              mt-2"
              style={{ marginLeft: "160px" }}
            />
            <h3 style={{ width: "400px" }}>
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white font-bold  rounded"
                style={{ marginTop: "20px" }}
                onClick={handleDeleteUser}
              >
                Yes, I'm sure
              </Button>
              <Button
                style={{ marginTop: "20px" }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold  rounded"
                onClick={() => setShowModal(false)}
              >
                No, Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
