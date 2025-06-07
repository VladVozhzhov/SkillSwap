import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForum } from "../context/ForumContext";
import { useAuth } from "../context/AuthContext";

const Create: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    createForum,
    updateForum,
    fetchForumById,
    forums,
  } = useForum();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { userId } = useAuth();

  useEffect(() => {
    if (id) {
      fetchForumById(id);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const forum = forums.find(f => f.id === id);
      if (forum) {
        setTitle(forum.title);
        setDescription(forum.description);
      }
    }
  }, [id, forums]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return alert("Please fill out all fields.");
    }

    try {
      if (id) {
        await updateForum(id, { title, description });
      } else {
        await createForum({ title, description, comments: [], createdBy: userId! });
      }
      navigate("/forum");
    } catch (error) {
      console.error("Error submitting forum:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4">
        {id ? "Edit Forum" : "Create New Forum"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter forum title"
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter forum description"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {id ? "Update Forum" : "Create Forum"}
        </button>
      </form>
    </div>
  );
};

export default Create;
