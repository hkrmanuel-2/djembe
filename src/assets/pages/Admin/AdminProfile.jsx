import { logger } from "@/lib/logger";
import { useState } from 'react';

function AdminProfile() {
  const [profileData, setProfileData] = useState({
    fname: '',
    lname: '',
    email: '',
    classes: '',
    profilePicture: '/assets/images/default-avatar.png'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your profile update logic here
    logger.log('Profile data:', profileData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: event.target.result
        }));
        document.getElementById('profilePreview').src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h1>Admin Profile Page</h1>
      <div className="container py-5">
        <div className="profile-container mx-auto">
          <h1 className="text-center mb-5">Manage Profile</h1>
          <div className="card p-4 mb-4">
            <form id="profileForm" encType="multipart/form-data" onSubmit={handleSubmit}>
              <div className="profile-picture-container">
                <img
                  src={profileData.profilePicture}
                  alt="Profile Picture"
                  className="profile-picture"
                  id="profilePreview"
                />
                <label htmlFor="profilePicture" className="picture-overlay">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="currentColor"
                    className="bi bi-camera"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z" />
                    <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                  </svg>
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profile_picture"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileChange}
                />
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fname"
                      value={profileData.fname}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lname"
                      value={profileData.lname}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Classes In Charge of</label>
                    <input
                      type="text"
                      className="form-control"
                      name="classes"
                      value={profileData.classes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="d-grid gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <a href="/Home.jsx" className="btn btn-outline-light">
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
