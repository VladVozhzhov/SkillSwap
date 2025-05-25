import React, { useEffect, useState } from "react";
import type { FormEvent } from 'react';
import axios from "axios";
import { useAuth } from './context/AuthContext'

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  senderUsername: string;
  receiverUsername: string;
  body: string;
  timestamp: string;
};

export const Messenger: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiverId, setReceiverId] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authed } = useAuth(); 

  useEffect(() => {
    if (!authed) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          "http://localhost:3500/api/message",
          { withCredentials: true }
        );
        // Map backend fields to frontend fields
        const mapped = res.data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId ?? msg.from ?? msg.sender_id,
          receiverId: msg.receiverId ?? msg.to ?? msg.recipient_id,
          senderUsername: msg.senderUsername ?? msg.sender_username ?? "",
          receiverUsername: msg.receiverUsername ?? msg.receiver_username ?? "",
          body: msg.body,
          timestamp: msg.timestamp,
        }));
        setMessages(mapped);
      } catch (e: any) {
        setError(e.response?.data || "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [authed]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!receiverId || !body) {
      setError("Please fill in both fields");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3500/api/message",
        { receiverId, body },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setMessages(prev => [res.data.message, ...prev]);
      setBody("");
    } catch (e: any) {
      setError(e.response?.data || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <form onSubmit={handleSend} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Recipient User ID"
          value={receiverId}
          onChange={e => setReceiverId(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <textarea
          rows={3}
          placeholder="Write your message here"
          value={body}
          onChange={e => setBody(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white py-2 rounded w-full hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Your Messages</h2>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading messages...</p>}
      {!loading && messages.length === 0 && <p>No messages found.</p>}

      <ul className="space-y-4">
        {messages.map(msg => (
          <li key={msg.id} className="p-4 rounded shadow bg-gray-100">
            <p className="mb-1">
              <strong>To:</strong> {msg.receiverUsername} ({msg.receiverId})
            </p>
            <p className="mb-2 font-mono">{msg.body}</p>
            <p className="text-xs text-gray-600">Time: {msg.timestamp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};