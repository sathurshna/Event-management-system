-- Seed data for Eventra Database
-- All users have the password: Password123!

-- 1. Insert Users
INSERT INTO users (id, name, email, password) VALUES
('user-seed-1', 'Alice Johnson', 'alice@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu'),
('user-seed-2', 'Bob Smith', 'bob@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu'),
('user-seed-3', 'Charlie Brown', 'charlie@example.com', '$2a$10$hxTNrqsU/pvAiQokDIfLXuNEs/d62lolGy.4QePulxNCh6ahs8abu');

-- 2. Insert Events
INSERT INTO events (id, title, description, date, end_date, location, is_public, host_id) VALUES
('event-seed-1', 'Tech Meetup 2026', 'A public gathering of tech enthusiasts to discuss the future of AI and web development.', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 'San Francisco Convention Center', TRUE, 'user-seed-1'),
('event-seed-2', 'Bob''s Birthday Party', 'Private celebration with close friends and family. There will be cake!', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'Central Park, NY', FALSE, 'user-seed-2'),
('event-seed-3', 'Product Launch Webinar', 'Join us online as we reveal our newest software update.', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'Zoom (Online)', TRUE, 'user-seed-3'),
('event-seed-4', 'Past Workshop', 'This event already happened. Thanks for coming!', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'Community Library', TRUE, 'user-seed-1');

-- 3. Insert RSVPs
INSERT INTO rsvps (id, status, user_id, event_id) VALUES
('rsvp-seed-1', 'ATTENDING', 'user-seed-2', 'event-seed-1'),
('rsvp-seed-2', 'MAYBE', 'user-seed-3', 'event-seed-1'),
('rsvp-seed-3', 'ATTENDING', 'user-seed-1', 'event-seed-2'),
('rsvp-seed-4', 'ATTENDING', 'user-seed-3', 'event-seed-2'),
('rsvp-seed-5', 'DECLINED', 'user-seed-1', 'event-seed-3');

-- 4. Insert Notifications (Just a few samples)
INSERT INTO notifications (id, type, message, link, user_id, is_read) VALUES
('notif-seed-1', 'EVENT_INVITE', 'Bob invited you to Bob''s Birthday Party', '/events/event-seed-2', 'user-seed-1', FALSE),
('notif-seed-2', 'RSVP_UPDATE', 'Alice is attending your event Tech Meetup 2026', '/events/event-seed-1', 'user-seed-1', TRUE);
