import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { feedAPI } from '../services/api';

const categories = [
  { name: 'IT', image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=200' },
  { name: 'Music', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200' },
  { name: 'Programming', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200' },
  { name: 'Art', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=200' },
  { name: 'Business', image: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=200' },
  { name: 'Other', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200' }
];

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '' });
  const [editPost, setEditPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editComment, setEditComment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      let response;
      if (selectedCategory === 'all') {
        response = await feedAPI.getAllPosts();
      } else {
        response = await feedAPI.getPostsByCategory(selectedCategory);
      }
      setPosts(response.data);
      // Load comments for each post
      response.data.forEach(post => loadComments(post.id));
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadComments = async (postId) => {
    try {
      const response = await feedAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      await feedAPI.createPost(newPost);
      setNewPost({ title: '', content: '', category: '' });
      setOpenDialog(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async () => {
    try {
      await feedAPI.updatePost(editPost.id, editPost);
      setEditPost(null);
      loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await feedAPI.deletePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await feedAPI.likePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      await feedAPI.addComment(postId, { content: newComment[postId] });
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (postId, commentId) => {
    try {
      await feedAPI.updateComment(postId, commentId, { content: editComment.content });
      setEditComment(null);
      loadComments(postId);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await feedAPI.deleteComment(postId, commentId);
      loadComments(postId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditClick = (post) => {
    setEditPost(post);
    setOpenDialog(true);
  };

  const handleDeleteClick = (postId) => {
    setPostToDelete(postId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await feedAPI.deletePost(postToDelete);
      setOpenDeleteDialog(false);
      setPostToDelete(null);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 203, 243, 0.05) 100%)',
        pointerEvents: 'none',
      }
    }}>
      <Container maxWidth="lg" sx={{ 
        flexGrow: 1, 
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4,
          }}>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Community Feed
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ 
                height: 'fit-content',
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                }
              }}
            >
              Create Feed
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            mb: 2,
            flexWrap: 'wrap',
          }}>
            <Chip
              label="All"
              onClick={() => setSelectedCategory('all')}
              color={selectedCategory === 'all' ? 'primary' : 'default'}
              sx={{ 
                mb: 1,
                borderRadius: 2,
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
            />
            {categories.map((category) => (
              <Chip
                key={category.name}
                label={category.name}
                onClick={() => setSelectedCategory(category.name)}
                color={selectedCategory === category.name ? 'primary' : 'default'}
                avatar={<Avatar src={category.image} />}
                sx={{ 
                  mb: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: 3,
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2 
                  }}>
                    <Typography variant="h6" component="h2" sx={{ 
                      fontWeight: 700,
                      color: '#1a237e',
                    }}>
                      {post.title}
                    </Typography>
                    <Chip 
                      label={post.category} 
                      color="primary" 
                      size="small" 
                      sx={{ 
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      }}
                    />
                  </Box>
                  <Typography variant="body1" paragraph sx={{ 
                    whiteSpace: 'pre-line',
                    color: '#37474f',
                    lineHeight: 1.7,
                  }}>
                    {post.content}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    flexWrap: 'wrap',
                  }}>
                    <Button
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleLikePost(post.id)}
                      sx={{ 
                        minWidth: '100px',
                        borderRadius: 2,
                        textTransform: 'none',
                        color: '#2196F3',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        }
                      }}
                    >
                      {post.likes} Likes
                    </Button>
                    <Button
                      startIcon={<CommentIcon />}
                      onClick={() => {
                        setSelectedPost(post);
                        setOpenCommentDialog(true);
                      }}
                      sx={{ 
                        minWidth: '120px',
                        borderRadius: 2,
                        textTransform: 'none',
                        color: '#2196F3',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        }
                      }}
                    >
                      {comments[post.id]?.length || 0} Comments
                    </Button>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleEditClick(post)}
                        sx={{
                          color: '#2196F3',
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteClick(post.id)}
                        sx={{
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ 
                    color: '#78909c',
                    display: 'block',
                    mt: 1,
                  }}>
                    Posted on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Create/Edit Post Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditPost(null);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          pb: 2,
          fontWeight: 600,
        }}>
          {editPost ? 'Edit Post' : 'Create New Feed'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={editPost ? editPost.title : newPost.title}
              onChange={(e) => editPost ? setEditPost({ ...editPost, title: e.target.value }) : setNewPost({ ...newPost, title: e.target.value })}
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={6}
              value={editPost ? editPost.content : newPost.content}
              onChange={(e) => editPost ? setEditPost({ ...editPost, content: e.target.value }) : setNewPost({ ...newPost, content: e.target.value })}
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={editPost ? editPost.category : newPost.category}
              onChange={(e) => editPost ? setEditPost({ ...editPost, category: e.target.value }) : setNewPost({ ...newPost, category: e.target.value })}
              margin="normal"
              variant="outlined"
              SelectProps={{
                native: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setEditPost(null);
            }}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editPost ? handleUpdatePost : handleCreatePost}
            variant="contained"
            color="primary"
            sx={{ 
              ml: 2,
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            {editPost ? 'Update Feed' : 'Create Feed'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog
        open={openCommentDialog}
        onClose={() => {
          setOpenCommentDialog(false);
          setEditComment(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            height: '80vh',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          } 
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          pb: 2,
          fontWeight: 600,
        }}>
          Comments - {selectedPost?.title}
        </DialogTitle>
        <DialogContent dividers sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            overflowY: 'auto', 
            flexGrow: 1,
            mb: 2,
          }}>
            {comments[selectedPost?.id]?.length > 0 ? (
              <List>
                {comments[selectedPost?.id]?.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start" sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ 
                            wordBreak: 'break-word',
                            color: '#37474f',
                          }}>
                            {comment.content}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ 
                            color: '#78909c',
                            mt: 0.5,
                          }}>
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        {editComment?.id === comment.id ? (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              size="small"
                              value={editComment.content}
                              onChange={(e) => setEditComment({ ...editComment, content: e.target.value })}
                              sx={{ 
                                width: '300px',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                            <IconButton 
                              onClick={() => handleUpdateComment(selectedPost.id, comment.id)}
                              sx={{
                                color: '#2196F3',
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                }
                              }}
                            >
                              <SendIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            <IconButton 
                              onClick={() => setEditComment(comment)}
                              size="small"
                              sx={{ 
                                mr: 1,
                                color: '#2196F3',
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                              size="small"
                              sx={{
                                color: '#f44336',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
              }}>
                <Typography variant="body1" sx={{ color: '#78909c' }}>
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            pt: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          }}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Add a comment..."
              value={newComment[selectedPost?.id] || ''}
              onChange={(e) => setNewComment({ ...newComment, [selectedPost.id]: e.target.value })}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={() => handleAddComment(selectedPost.id)}
              size="large"
              disabled={!newComment[selectedPost?.id]?.trim()}
              sx={{
                color: '#2196F3',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenCommentDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setPostToDelete(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          pb: 2,
          fontWeight: 600,
        }}>
          Delete Post
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: '#37474f' }}>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setOpenDeleteDialog(false);
              setPostToDelete(null);
            }}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained" 
            color="error"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(45deg, #f44336 30%, #ff5252 90%)',
              boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #ff1744 90%)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Feed;