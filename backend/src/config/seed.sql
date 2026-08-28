-- Seed data for Eventra Database
-- All users have the password: Password123!

-- 1. Insert Users (Hosts & Guests)
INSERT INTO users (id, name, email, password) VALUES
('user-alice', 'Alice Johnson', 'alice@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu'),
('user-bob', 'Bob Smith', 'bob@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu'),
('user-charlie', 'Charlie Brown', 'charlie@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu'),
('user-diana', 'Diana Prince', 'diana@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu'),
('user-evan', 'Evan Wright', 'evan@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu');


-- 2. Insert Realistic Events
INSERT INTO events (id, title, description, date, end_date, location, is_public, host_id) VALUES
-- Event 1: Tech Meetup (Public, Upcoming)
('evt-meetup', 'React Native Developer Meetup', 'Join local developers for an evening of networking, lightning talks, and free pizza! We will cover Expo updates and cross-platform architecture.', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'WeWork Downtown, 4th Floor', TRUE, 'user-alice'),

-- Event 2: Birthday Party (Private, Upcoming)
('evt-bday', 'Bob''s 30th Birthday Bash!', 'I am turning 30! Come celebrate with me at the park. There will be drinks, BBQ, and music. Please RSVP so I know how much food to buy.', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'Central Park, Picnic Area B', FALSE, 'user-bob'),

-- Event 3: Concert (Public, Upcoming)
('evt-concert', 'Summer Indie Music Festival', 'A multi-band indie rock concert featuring local talent and touring headliners. Early arrival recommended for good spots.', DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'Riverside Amphitheater', TRUE, 'user-charlie'),

-- Event 4: University Event (Public, Upcoming)
('evt-university', 'State University Career Fair', 'Open to all students and alumni. Over 50 top tech companies and financial firms will be recruiting for summer internships and full-time roles.', DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY), 'University Main Stadium', TRUE, 'user-diana'),

-- Event 5: Workshop (Private, Upcoming)
('evt-workshop', 'Mastering UI/UX Design Workshop', 'An intensive 4-hour workshop covering Figma prototypes, color theory, and user testing. Limited seats available.', DATE_ADD(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'Creative Hub Studios', FALSE, 'user-evan'),

-- Event 6: Networking Breakfast (Public, Tomorrow)
('evt-breakfast', 'Founders & Investors Breakfast', 'Morning coffee networking session connecting early-stage startup founders with local angel investors.', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 'The Blue Roaster Coffee Shop', TRUE, 'user-alice'),

-- Event 7: Past Concert (Public, Past)
('evt-past1', 'Winter Jazz Night', 'An unforgettable evening of smooth jazz to warm up the cold winter night. Thank you to everyone who attended!', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'Downtown Jazz Lounge', TRUE, 'user-charlie'),

-- Event 8: Past Private Dinner (Private, Past)
('evt-past2', 'Team Celebration Dinner', 'Dinner to celebrate hitting our Q3 sales targets! Great work everyone.', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY), 'Steakhouse on 5th', FALSE, 'user-diana');


-- 3. Insert RSVPs
INSERT INTO rsvps (id, status, user_id, event_id) VALUES
-- People attending the Meetup
('rsvp-1', 'ATTENDING', 'user-bob', 'evt-meetup'),
('rsvp-2', 'ATTENDING', 'user-charlie', 'evt-meetup'),
('rsvp-3', 'MAYBE', 'user-evan', 'evt-meetup'),

-- People attending Bob's Birthday
('rsvp-4', 'ATTENDING', 'user-alice', 'evt-bday'),
('rsvp-5', 'ATTENDING', 'user-diana', 'evt-bday'),

-- People attending the Concert
('rsvp-6', 'ATTENDING', 'user-alice', 'evt-concert'),
('rsvp-7', 'ATTENDING', 'user-bob', 'evt-concert'),
('rsvp-8', 'DECLINED', 'user-evan', 'evt-concert'),

-- People attending Career Fair
('rsvp-9', 'ATTENDING', 'user-charlie', 'evt-university'),
('rsvp-10', 'MAYBE', 'user-evan', 'evt-university'),

-- People attending the Past Jazz Night
('rsvp-11', 'ATTENDING', 'user-alice', 'evt-past1'),
('rsvp-12', 'ATTENDING', 'user-bob', 'evt-past1');


-- 4. Insert Notifications (Just a few sample notifications for Alice & Bob)
INSERT INTO notifications (id, type, message, link, user_id, is_read) VALUES
('notif-1', 'EVENT_INVITE', 'Bob invited you to Bob''s 30th Birthday Bash!', '/events/evt-bday', 'user-alice', FALSE),
('notif-2', 'RSVP_UPDATE', 'Diana is attending your event React Native Developer Meetup', '/events/evt-meetup', 'user-alice', TRUE),
('notif-3', 'EVENT_INVITE', 'Diana invited you to State University Career Fair', '/events/evt-university', 'user-bob', FALSE),
('notif-4', 'EVENT_REMINDER', 'Reminder: Founders & Investors Breakfast is happening tomorrow!', '/events/evt-breakfast', 'user-bob', FALSE);
