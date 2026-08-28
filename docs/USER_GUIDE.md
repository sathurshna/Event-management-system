# Eventra User Guide & Feature Showcase

Welcome to the Eventra User Guide! This document highlights the core functionalities, user workflows, and design features implemented across both our Web and Mobile applications. 

## 1. Authentication & Onboarding
Both platforms support a secure JWT-based authentication system.
- **Login / Registration**: Users are greeted with a beautiful glassmorphic UI. Passwords are securely hashed via bcrypt.
- **Persistent Sessions**: React Native utilizes `expo-secure-store` to keep mobile users securely logged in across sessions, while the web uses HTTP-only cookies.

## 2. Dynamic Calendar & Event Discovery
The core of Eventra is the interactive `FullCalendar` integration which gives users a bird's-eye view of all upcoming and past activities.
- **Color Coding**: 
  - 🟨 **Yellow**: Public events open for discovery.
  - 🟪 **Purple**: Private, invite-only events.
  - ⬜ **Gray**: Past events for historical tracking.
- **Quick Details**: Clicking any calendar event gracefully slides in a side-panel (or opens a modal on mobile) with instant event details, skipping unnecessary page loads.

## 3. Event Creation & Management
Users can step into the role of a Host with our intuitive event creation forms.
- **Public vs. Private Events**:
  - **Public Events**: Show up globally in the calendar for anyone to discover.
  - **Private Events**: Hidden from the global feed. The host must explicitly send invitations using the built-in email/token system.
- **Host Privileges**: Only the original creator (Host) of an event will see the **Edit** and **Delete** options on the Event Details screen.

## 4. RSVPs and Invitations
Managing guest lists is completely streamlined.
- **Real-time RSVPs**: Users can set their status to *Attending*, *Maybe*, or *Declined*.
- **Live Guest Lists**: The host dashboard updates in real-time, showing exactly who is coming and generating accurate RSVP count statistics.
- **Secure Email Invites**: Hosts can type in an email address to send a secure, tokenized invitation link. When the guest clicks it, they are authenticated and linked directly to the private event.

## 5. In-App Notifications & Background Reminders
Eventra actively keeps users informed without being intrusive.
- **Notification Bell**: A navigation bar badge displays the number of unread notifications. Users can open the dropdown to mark individual items or all items as read.
- **Instant Alerts**:
  - Event Invitations ("Alice invited you to Tech Meetup")
  - RSVP Updates ("Bob is now attending your event")
- **Automated Cron Jobs**: A background Node.js service constantly polls the database and automatically dispatches "Event Reminder" notifications to all attendees exactly 24 hours before an event begins.

## 6. Design & Accessibility
- **Glassmorphism**: A sleek, modern aesthetic using translucent panels, blurred backgrounds, and subtle gradients.
- **Responsive Layouts**: The React web app automatically reflows for tablets and desktops, while the Expo Mobile app provides a native touch-friendly experience using Bottom Tabs and Stack navigation.
