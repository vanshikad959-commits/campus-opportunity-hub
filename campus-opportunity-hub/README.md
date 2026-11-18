# Campus Opportunity Hub

A web platform that brings every campus hackathon, internship, workshop, competition and event into one feed, recommends the right ones to each student, and reminds them before deadlines close.

## How to run

No installation is needed.

1. Unzip the folder.
2. Double-click `index.html` (opens in Chrome, Edge or Firefox).

The app stores its data in the browser's localStorage, so it works offline. The demo data is created automatically on first run.

## Demo accounts

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Student | student@campus.edu  | student123  |
| Admin   | admin@campus.edu    | admin123    |

You can also click **Create profile** to register a new student.

To reset all data, open the browser console (F12) and run `Store.resetAll(); location.reload();`

## Features

| Feature | Where |
|---|---|
| Student profiles (branch, year, CGPA, skills, interests) | Create profile / My profile |
| Campus opportunity feed | Opportunity feed |
| Smart search & filters (category, skill, branch eligibility, deadline/date, mode, sort) | Opportunity feed |
| AI opportunity recommender with match % and explanation | For you |
| Deadline tracker with calendar, reminders, browser notifications, .ics export | Deadline tracker, bell icon |
| Saved opportunities (bookmarks) | Saved |
| Admin dashboard: publish, edit, delete, analytics, student list | Sign in as admin |

Also: dark mode, mobile-responsive layout, "Mark as applied" status, form validation.

## Project structure

```
campus-opportunity-hub/
├── index.html          Entry page
├── css/style.css       Design system and layout
└── js/
    ├── data.js         Constants, seed opportunities and users
    ├── store.js        Data layer (localStorage with in-memory fallback)
    ├── recommender.js  AI recommender (TF-IDF + cosine similarity + eligibility rules)
    ├── ui.js           Icons, formatting, modals, toasts, reusable components
    └── app.js          Router, views and controllers
```

## Technology

HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript (ES6), Web Storage API, Notification API, iCalendar (.ics) export.
