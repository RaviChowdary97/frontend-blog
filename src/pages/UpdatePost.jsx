import { Alert, FileInput, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const navigate = useNavigate();
  const { postId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    try {
      const fetchPost = async () => {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message);
          setPublishError(data.message);
          return;
        }
        if (res.ok) {
          setPublishError(null);
          setFormData(data.posts[0]);
        }
      };

      fetchPost();
    } catch (error) {
      console.log(error.message);
    }
  }, [postId]);

  console.log(formData);
  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }

      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/post/updatepost/${formData._id}/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  return (
    <>
      <div style={{ background: "linear-gradient(45deg, #C9B0FD, #EA6B50)" }}>
        <div className="p-3 max-w-3xl mx-auto min-h-screen">
          <h1 className="text-center text-3xl my-7 font-semibold">
            Update a Post
          </h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 sm:flex-row justify-between">
              <TextInput
                style={{ width: "300px", borderColor: "gray" }}
                type="text"
                placeholder="Title"
                required
                id="title"
                className="flex-1 "
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                value={formData.title}
              />
              <Select
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                value={formData.category}
              >
                <option value="uncategorized">Select a category</option>
                <option value="Personal Development">
                  Personal Development
                </option>
                <option value="Technology">Technology</option>
                <option value="Culture">Culture</option>
                <option value="Personal Stories">Personal Stories</option>
                <option value="Education">Education</option>
                <option value="Business and Finance">
                  Business and Finance
                </option>
              </Select>
            </div>
            <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
              <FileInput
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "black",
                  color: "white",
                  border: "1px solid",
                  borderRadius: "3px",
                  padding: "10px",
                }}
                onClick={handleUploadImage}
                disabled={imageUploadProgress}
              >
                {imageUploadProgress ? (
                  <div className="w-16 h-16">
                    <CircularProgressbar
                      value={imageUploadProgress}
                      text={`${imageUploadProgress || 0}%`}
                    />
                  </div>
                ) : (
                  "Upload Image"
                )}
              </button>
            </div>

            {imageUploadError && (
              <Alert color="failure">{imageUploadError}</Alert>
            )}
            {formData.image && (
              <img
                src={formData.image}
                alt="upload"
                className="w-full h-72 object-cover"
              />
            )}
            <ReactQuill
              theme="snow"
              placeholder="Write Something"
              className="h-60 mb-12"
              required
              onChange={(value) => {
                setFormData({ ...formData, content: value });
              }}
              value={formData.content}
            />
            <Button
              type="submit"
              style={{ background: "linear-gradient(45deg, #F2672D, red)" }}
            >
              Update Post
            </Button>
            {publishError && (
              <Alert
                className="mt-1"
                style={{
                  background: "linear-gradient(45deg, gold, red)",
                  padding: "0px",
                }}
              >
                {publishError}
              </Alert>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
