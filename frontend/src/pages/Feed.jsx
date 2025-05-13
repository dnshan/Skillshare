import { useEffect, useState } from 'react';
import { postAPI, commentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDistanceToNow } from 'date-fns';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [editingPost, setEditingPost] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const fetchPosts = async () => {
    try {
      const res = await postAPI.getFeed();
      setPosts(res.data.content);
      setError(null);
    } catch (err) {
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleCreatePost = async () => {
    try {
      const response = await postAPI.createPost(newPost);
      setShowCreateForm(false);
      setNewPost({ title: '', content: '' });
      fetchPosts();
    } catch (err) {
      setError('Failed to create post. Please try again.');
    }
  };

  const handleEditPost = async (postId, updatedData) => {
    try {
      await postAPI.updatePost(postId, updatedData);
      setEditingPost(null);
      fetchPosts();
    } catch (err) {
      setError('Failed to update post. Please try again.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postAPI.deletePost(postId);
        fetchPosts();
      } catch (err) {
        setError('Failed to delete post. Please try again.');
      }
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await postAPI.likePost(postId);
      fetchPosts();
    } catch (err) {
      setError('Failed to like post. Please try again.');
    }
  };

  const handleUnlikePost = async (postId) => {
    try {
      await postAPI.unlikePost(postId);
      fetchPosts();
    } catch (err) {
      setError('Failed to unlike post. Please try again.');
    }
  };

  const handleAddComment = async (postId) => {
    try {
      await commentAPI.addComment(postId, newComment[postId]);
      setNewComment({ ...newComment, [postId]: '' });
      fetchPosts();
    } catch (err) {
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      fetchPosts();
    } catch (err) {
      setError('Failed to delete comment. Please try again.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <FullPageLoading />;
  if (error && !refreshing) return <FullPageError message={error} onRetry={handleRefresh} />;

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1 className="feed-title">Your Feed</h1>
        <div className="feed-actions">
          <button 
            className="create-post-btn"
            onClick={() => setShowCreateForm(true)}
          >
            Create Post
          </button>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="create-post-form">
          <h3>Create New Post</h3>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <div className="form-actions">
            <button onClick={handleCreatePost}>Post</button>
            <button onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="feed-content">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onLike={handleLikePost}
              onUnlike={handleUnlikePost}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              showComments={showComments[post.id]}
              setShowComments={(show) => setShowComments({ ...showComments, [post.id]: show })}
              newComment={newComment[post.id]}
              setNewComment={(content) => setNewComment({ ...newComment, [post.id]: content })}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PostCard = ({ 
  post, 
  onEdit, 
  onDelete, 
  onLike, 
  onUnlike, 
  onAddComment, 
  onDeleteComment,
  showComments,
  setShowComments,
  newComment,
  setNewComment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(post.content);
  };

  const handleSave = () => {
    onEdit(post.id, { content: editedContent });
    setIsEditing(false);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          {post.author?.avatar && (
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="author-avatar"
            />
          )}
          <div>
            <span className="author-name">{post.author?.name || 'Unknown'}</span>
            <span className="post-time">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="post-actions">
          <button onClick={handleEdit} className="action-btn">Edit</button>
          <button onClick={() => onDelete(post.id)} className="action-btn delete">Delete</button>
        </div>
      </div>
      
      <div className="post-body">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="edit-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>
          </>
        )}
        
        {post.images?.length > 0 && (
          <div className="post-images">
            {post.images.slice(0, 3).map((image, index) => (
              <div key={index} className="post-image-container">
                <img 
                  src={image.url} 
                  alt={`Post ${index + 1}`} 
                  className="post-image"
                />
                {index === 2 && post.images.length > 3 && (
                  <div className="image-counter">+{post.images.length - 3}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="post-footer">
        <button 
          className="action-btn"
          onClick={() => post.isLiked ? onUnlike(post.id) : onLike(post.id)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isLiked ? "red" : "none"} stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{post.likesCount || 0} Likes</span>
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{post.commentsCount || 0} Comments</span>
        </button>
        <button className="action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments?.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.author.name}</span>
                  <span className="comment-time">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  <button 
                    className="delete-comment"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
          <div className="add-comment">
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={() => onAddComment(post.id)}>Comment</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for better organization
const FullPageLoading = () => (
  <div className="full-page-center">
    <LoadingSpinner size="large" />
  </div>
);

const FullPageError = ({ message, onRetry }) => (
  <div className="full-page-center">
    <ErrorMessage message={message} />
    <button className="retry-btn" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

// CSS Styles
const styles = `
  .feed-container {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }

  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .feed-title {
    font-size: 28px;
    color: #333;
    margin: 0;
  }

  .feed-actions {
    display: flex;
    gap: 12px;
  }

  .create-post-btn {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .create-post-btn:hover {
    background-color: #0056b3;
  }

  .refresh-btn {
    padding: 8px 16px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .refresh-btn:hover {
    background-color: #f0f0f0;
  }

  .refresh-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .create-post-form {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 24px;
  }

  .create-post-form h3 {
    margin: 0 0 16px;
    color: #333;
  }

  .create-post-form input,
  .create-post-form textarea {
    width: 100%;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
  }

  .create-post-form textarea {
    min-height: 100px;
    resize: vertical;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .form-actions button {
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .form-actions button:first-child {
    background-color: #007bff;
    color: white;
    border: none;
  }

  .form-actions button:last-child {
    background-color: #fff;
    border: 1px solid #ddd;
  }

  .post-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    overflow: hidden;
  }

  .post-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
  }

  .post-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .author-name {
    font-weight: 600;
    color: #333;
  }

  .post-time {
    display: block;
    font-size: 12px;
    color: #666;
  }

  .post-actions {
    display: flex;
    gap: 8px;
  }

  .post-actions .action-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 16px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .post-actions .action-btn:hover {
    background: #f0f0f0;
  }

  .post-actions .action-btn.delete {
    color: #dc3545;
    border-color: #dc3545;
  }

  .post-actions .action-btn.delete:hover {
    background: #dc3545;
    color: white;
  }

  .post-body {
    padding: 16px;
  }

  .post-title {
    margin: 0 0 8px;
    color: #333;
  }

  .post-content {
    margin: 0;
    color: #444;
    line-height: 1.5;
  }

  .edit-form {
    margin-bottom: 16px;
  }

  .edit-form textarea {
    width: 100%;
    min-height: 100px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 12px;
    resize: vertical;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .edit-actions button {
    padding: 6px 12px;
    border-radius: 16px;
    cursor: pointer;
    font-size: 12px;
  }

  .edit-actions button:first-child {
    background: #007bff;
    color: white;
    border: none;
  }

  .edit-actions button:last-child {
    background: white;
    border: 1px solid #ddd;
  }

  .post-images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 16px;
  }

  .post-image-container {
    position: relative;
    padding-bottom: 100%;
  }

  .post-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .image-counter {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border-radius: 8px;
  }

  .post-footer {
    padding: 12px 16px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 16px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    transition: color 0.2s;
  }

  .action-btn:hover {
    color: #007bff;
  }

  .action-btn svg {
    transition: fill 0.2s;
  }

  .comments-section {
    padding: 16px;
    border-top: 1px solid #eee;
    background: #f8f9fa;
  }

  .comments-list {
    margin-bottom: 16px;
  }

  .comment {
    background: white;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .comment-author {
    font-weight: 600;
    color: #333;
  }

  .comment-time {
    font-size: 12px;
    color: #666;
  }

  .delete-comment {
    margin-left: auto;
    padding: 4px 8px;
    border: 1px solid #dc3545;
    border-radius: 12px;
    background: white;
    color: #dc3545;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-comment:hover {
    background: #dc3545;
    color: white;
  }

  .comment-content {
    margin: 0;
    color: #444;
  }

  .add-comment {
    display: flex;
    gap: 8px;
  }

  .add-comment textarea {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    resize: none;
    min-height: 40px;
  }

  .add-comment button {
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .add-comment button:hover {
    background: #0056b3;
  }

  .empty-feed {
    text-align: center;
    padding: 40px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .empty-feed svg {
    margin-bottom: 16px;
    color: #ccc;
  }

  .empty-feed h3 {
    margin: 8px 0;
    color: #333;
  }

  .empty-feed p {
    color: #666;
    margin: 0;
  }

  .full-page-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
  }
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Feed;