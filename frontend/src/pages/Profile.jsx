import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  MoreVert as MoreVertIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    education: '',
    occupation: '',
    skills: [],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        bio: res.data.bio || '',
        location: res.data.location || '',
        education: res.data.education || '',
        occupation: res.data.occupation || '',
        skills: res.data.skills || [],
        socialLinks: res.data.socialLinks || {
          linkedin: '',
          github: '',
          twitter: '',
        }
      });
      setError(null);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await userAPI.updateProfile(formData);
      setProfile(res.data);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await userAPI.uploadAvatar(formData);
        setProfile(prev => ({ ...prev, profilePictureUrl: res.data.profilePictureUrl }));
        setOpenAvatarDialog(false);
      } catch (err) {
        setError('Failed to upload avatar');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !profile) return <LoadingSpinner />;
  if (error && !profile) return <ErrorMessage message={error} />;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profile?.profilePictureUrl}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                    onClick={() => setOpenAvatarDialog(true)}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {profile?.name}
                    </Typography>
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {profile?.bio || 'No bio yet'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {profile?.location && (
                      <Chip
                        icon={<LocationIcon />}
                        label={profile.location}
                        variant="outlined"
                      />
                    )}
                    {profile?.education && (
                      <Chip
                        icon={<SchoolIcon />}
                        label={profile.education}
                        variant="outlined"
                      />
                    )}
                    {profile?.occupation && (
                      <Chip
                        icon={<WorkIcon />}
                        label={profile.occupation}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
              >
                <Tab label="About" />
                <Tab label="Activity" />
                <Tab label="Skills" />
                <Tab label="Settings" />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  {editMode ? (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        multiline
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                      <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                      <TextField
                        fullWidth
                        label="Education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                      />
                      <TextField
                        fullWidth
                        label="Occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                      />
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>About</Typography>
                        <Typography variant="body1" color="text.secondary">
                          {profile?.bio || 'No bio available'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>Contact Information</Typography>
                        <List>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <EmailIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary="Email"
                              secondary={profile?.email}
                            />
                          </ListItem>
                          {profile?.location && (
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  <LocationIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary="Location"
                                secondary={profile.location}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>Education & Work</Typography>
                        <List>
                          {profile?.education && (
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  <SchoolIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary="Education"
                                secondary={profile.education}
                              />
                            </ListItem>
                          )}
                          {profile?.occupation && (
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  <WorkIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary="Occupation"
                                secondary={profile.occupation}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                  <List>
                    {/* Add activity items here */}
                    <ListItem>
                      <ListItemText
                        primary="Completed Course: Web Development Basics"
                        secondary="2 days ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Shared a post in the community"
                        secondary="5 days ago"
                      />
                    </ListItem>
                  </List>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Skills & Expertise</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile?.skills?.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Account Settings</Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Manage your notification preferences"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Privacy Settings"
                        secondary="Control who can see your profile"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Change Password"
                        secondary="Update your account password"
                      />
                    </ListItem>
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Stats Card */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Statistics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.coursesCompleted || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Courses
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.postsCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Posts
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.followersCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Followers
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Social Links Card */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Social Links</Typography>
                <List>
                  {profile?.socialLinks?.linkedin && (
                    <ListItem>
                      <ListItemText
                        primary="LinkedIn"
                        secondary={profile.socialLinks.linkedin}
                      />
                    </ListItem>
                  )}
                  {profile?.socialLinks?.github && (
                    <ListItem>
                      <ListItemText
                        primary="GitHub"
                        secondary={profile.socialLinks.github}
                      />
                    </ListItem>
                  )}
                  {profile?.socialLinks?.twitter && (
                    <ListItem>
                      <ListItemText
                        primary="Twitter"
                        secondary={profile.socialLinks.twitter}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Avatar Upload Dialog */}
      <Dialog
        open={openAvatarDialog}
        onClose={() => setOpenAvatarDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <input
              accept="image/*"
              type="file"
              id="avatar-upload"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCameraIcon />}
              >
                Upload New Photo
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAvatarDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setEditMode(true);
          setAnchorEl(null);
        }}>
          Edit Profile
        </MenuItem>
        <MenuItem onClick={() => {
          setOpenAvatarDialog(true);
          setAnchorEl(null);
        }}>
          Change Photo
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Profile;
