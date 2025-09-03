import React from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileAbout from '../components/profile/ProfileAbout';
import ProfileSkills from '../components/profile/ProfileSkills';
import ProfileProjects from '../components/profile/ProfileProjects';
import ProfileActivity from '../components/profile/ProfileActivity';

const Profile = () => {
  // Sample user data
const user = {
    name: 'Name Surname',
    avatars: [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/men/2.jpg',
      'https://randomuser.me/api/portraits/men/3.jpg'
    ],
    description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.',
    location: 'Random Place Street',
    about: 'Lorem ipsum dolor sit amet.\nEt facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'name.surname@example.com'
    },
    skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6', 'Skill 7', 'Skill 8', 'Skill 9'],
    languages: ['Lang 1', 'Lang 2', 'Lang 3', 'Lang 4', 'Lang 5', 'Lang 6', 'Lang 7', 'Lang 8', 'Lang 9'],
    projects: [
      {
        initials: 'JD',
        title: 'Project Title',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        initials: 'PT',
        title: 'Project Title',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        initials: 'WD',
        title: 'Project Title',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      }
    ],
    activities: [
      {
        title: 'Random Event 1',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        title: 'Random Event 2',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        title: 'Random Event 3',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      }
    ]
  };

  return (
    <div className="profile-container">
      <ProfileHeader user={user} />
      
      <div className="profile-content">
        <div className="profile-main">
          <ProfileAbout about={user.about} contact={user.contact} />
          <ProfileSkills skills={user.skills} languages={user.languages} />
        </div>
        
        <div className="profile-sidebar">
          <ProfileProjects projects={user.projects} />
          <ProfileActivity activities={user.activities} />
        </div>
      </div>
    </div>
  );
};


export default Profile;