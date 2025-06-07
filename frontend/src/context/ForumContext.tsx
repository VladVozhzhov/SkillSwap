import axios from "axios";
import React, { createContext, useContext } from "react";

export type CommentType = {
  id: string
  forum_id: string
  user_id: string
  createdBy: string;
  message: string
  createdAt: string
  updatedAt: string
  edited: boolean
}

export type ForumType = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  createdBy: string
  authorName?: string
  comments: CommentType[]
}

type ForumContextType = {
  ForumType: ForumType
  CommentType: CommentType
  fetchForums: () => Promise<void>
  fetchForumById: (id: string) => Promise<void>
  createForum: (forum: Omit<ForumType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateForum: (id: string, forum: Partial<Omit<ForumType, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteForum: (id: string) => Promise<void>
  getComments: (forumId: string) => Promise<void>
  createComment: (forumId: string, message: string) => Promise<void>
  updateComment: (forumId: string, commentId: string, comment: CommentType) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  forums: ForumType[]
  comments: CommentType[]
}

const ForumContext = createContext<ForumContextType | undefined>(undefined);

export const ForumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  type ForumState = {
    forums: ForumType[];
    comments: CommentType[];
  };

  type ForumAction =
    | { type: "SET_FORUMS"; payload: ForumType[] }
    | { type: "ADD_FORUM"; payload: ForumType }
    | { type: "UPDATE_FORUM"; payload: ForumType }
    | { type: "DELETE_FORUM"; payload: string }
    | { type: "SET_COMMENTS"; payload: { forumId: string, comments: CommentType[] } }
    | { type: "ADD_COMMENT"; payload: { forumId: string, comment: CommentType } }
    | { type: "UPDATE_COMMENT"; payload: { forumId: string, comment: CommentType } }
    | { type: "DELETE_COMMENT"; payload: { commentId: string } };

  const forumReducer = (state: ForumState, action: ForumAction): ForumState => {
    switch (action.type) {
      case "SET_FORUMS":
        return { ...state, forums: action.payload };
      case "ADD_FORUM":
        return { ...state, forums: [...state.forums, action.payload] };
      case "UPDATE_FORUM":
        return {
          ...state,
          forums: state.forums.map((forum) =>
            forum.id === action.payload.id ? action.payload : forum
          ),
        };
      case "DELETE_FORUM":
        return {
          ...state,
          forums: state.forums.filter((forum) => forum.id !== action.payload),
        };
      case "SET_COMMENTS":
        return {
          ...state,
          forums: state.forums.map((forum) =>
            forum.id === action.payload.forumId
              ? { ...forum, comments: action.payload.comments }
              : forum
          ),
        };
      case "ADD_COMMENT":
        return {
          ...state,
          forums: state.forums.map((forum) =>
            forum.id === action.payload.forumId
              ? { ...forum, comments: [...forum.comments, action.payload.comment] }
              : forum
          ),
        };
      case "UPDATE_COMMENT":
        return {
          ...state,
          forums: state.forums.map((forum) =>
            forum.id === action.payload.forumId
              ? {
                  ...forum,
                  comments: forum.comments.map((comment) =>
                    comment.id === action.payload.comment.id ? action.payload.comment : comment
                  ),
                }
              : forum
          ),
        };
      case "DELETE_COMMENT":
        return {
          ...state,
          forums: state.forums.map((forum) => ({
            ...forum,
            comments: forum.comments.filter(
              (comment) => comment.id !== action.payload.commentId
            ),
          })),
        };
      default:
        throw new Error(`Unhandled action type: ${(action as ForumAction).type}`);
    }
  };

  const [state, dispatch] = React.useReducer(forumReducer, {
    forums: [],
    comments: []
  });

  function mapForum(forum: any): ForumType {
    return {
      id: forum.id,
      title: forum.title,
      description: forum.description,
      createdAt: forum.createdAt || forum.created_at,
      updatedAt: forum.updatedAt || forum.updated_at,
      createdBy: forum.createdBy || forum.created_by,
      authorName: forum.authorName || forum.author_name,
      comments: forum.comments
        ? forum.comments.map(mapComment)
        : [],
    };
  }

  function mapComment(comment: any): CommentType {
    return {
      id: comment.id,
      forum_id: comment.forum_id,
      user_id: comment.user_id,
      createdBy: comment.user_name || comment.username || '',
      message: comment.message,
      createdAt: comment.createdAt || comment.created_at,
      updatedAt: comment.updatedAt || comment.updated_at,
      edited: comment.edited,
    };
  }

  const fetchForums = async (): Promise<void> => {
    try {
      const response = await axios.get<ForumType[]>("http://localhost:3500/api/forums", { withCredentials: true });
      const mapped = response.data.map(mapForum);
      dispatch({ type: "SET_FORUMS", payload: mapped });
    } catch (error) {
      console.error("Error fetching forums:", error);
    }
  }

  const fetchForumById = async (id: string): Promise<void> => {
    try {
      const response = await axios.get<ForumType>("http://localhost:3500/api/forums-id", {
        params: { id },
        withCredentials: true,
      });
      const mapped = mapForum(response.data);
      const existing = state.forums.find(f => f.id === id);

      if (existing) {
        dispatch({ type: "UPDATE_FORUM", payload: mapped });
      } else {
        dispatch({ type: "ADD_FORUM", payload: mapped });
      }

    } catch (error) {
      console.error("Error fetching forum by ID:", error);
    }
  };


  const createForum = async (forum: Omit<ForumType, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const response = await axios.post<ForumType>(
        "http://localhost:3500/api/forums",
        {
          title: forum.title,
          description: forum.description,
        },
        { withCredentials: true }
      );
      dispatch({ type: "ADD_FORUM", payload: response.data });
    } catch (error) {
      console.error("Error creating forum:", error);
    }
  };

  const updateForum = async (id: string, forum: Partial<Omit<ForumType, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    try {
      const response = await axios.put<ForumType>(`http://localhost:3500/api/forums-id`, forum, { params: { id }, withCredentials: true });
      dispatch({ type: "UPDATE_FORUM", payload: response.data });
    } catch (error) {
      console.error("Error updating forum:", error);
    }
  }

  const deleteForum = async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:3500/api/forums-id`, { params: { id }, withCredentials: true });
      dispatch({ type: "DELETE_FORUM", payload: id });
    } catch (error) {
      console.error("Error deleting forum:", error);
    }
  }

  const getComments = async (forumId: string): Promise<void> => {
    try {
      const response = await axios.get<CommentType[]>(`http://localhost:3500/api/comments`, { params: { forumId }, withCredentials: true });
      const mapped = response.data.map(mapComment);
      dispatch({ type: "SET_COMMENTS", payload: { forumId, comments: mapped } });
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  const createComment = async (forumId: string, message: string): Promise<void> => {
    try {
      const response = await axios.post<CommentType>(
        `http://localhost:3500/api/comments`,
        { message },
        { params: { forumId }, withCredentials: true }
      );
      const mapped = mapComment(response.data);
      dispatch({ type: "ADD_COMMENT", payload: { forumId, comment: mapped } });
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  }

  const updateComment = async (forumId: string, commentId: string, comment: CommentType): Promise<void> => {
    try {
      const response = await axios.put<CommentType>(
        `http://localhost:3500/api/comments`,
        { message: comment.message },
        { params: { commentId }, withCredentials: true }
      );
      const mapped = mapComment(response.data);
      dispatch({ type: "UPDATE_COMMENT", payload: { forumId, comment: mapped } });
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  }

  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:3500/api/comments`, {
        params: { commentId },
        withCredentials: true
      });
      dispatch({ type: "DELETE_COMMENT", payload: { commentId } });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }

  return (
    <ForumContext.Provider value={{ 
      ForumType: {} as ForumType, 
      CommentType: {} as CommentType, 
      fetchForums, fetchForumById, createForum, updateForum, deleteForum, 
      getComments, createComment, updateComment, deleteComment,
      forums: state.forums, comments: state.comments 
    }}>
      {children}
    </ForumContext.Provider>
  );
};

export function useForum(): ForumContextType {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error("useForum must be used within ForumProvider");
  }
  return context;
}