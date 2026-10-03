# WD-302 Final Project: Employee Time Clock

ABC Holding Ltd. has about 40 employees across two offices. Today, staff write their hours on paper sheets, a manager retypes them into a spreadsheet every Friday, and payroll is wrong often enough that nobody trusts it. The company wants one system where employees clock in and out, and managers can see who is working right now and how many hours each person logged each week.

You are tasked with building that system as a Next.js application backed by PostgreSQL.

## Choose what the company does

ABC Holding Ltd. is the parent company. Your team decides what the business actually is. Some options:

- A restaurant or cafe group
- A construction or trades company
- A retail chain
- A clinic or care home
- A warehouse or logistics company
- A gym or sports facility

Make the branding, wording, sample employees, and design fit your chosen business.

## Design

No UI wireframes are provided. Your team designs the interface. You are free to use AI tools and design references to produce the wireframes you need, for example [Dribbble](https://dribbble.com/) for inspiration and [Google Stitch](https://stitch.withgoogle.com/) for generated screens. Treat generated designs as a starting point and make them fit your company.

## Public home page

The root route `/` is the company's public home page. Anyone can open it without logging in. It presents the company and links to the login page. No clock data, employee names, or hours appear on public pages.

## Login and roles

There is one login page for everyone. After login, the app sends the user to the right place based on their role:

- **Employee** lands on their clock page.
- **Admin** lands on the admin dashboard.

Implement login, logout, and sessions yourself using cookie sessions. Do not use a third-party authentication provider. Passwords must be securely hashed. Every server-side action that reads or changes data must verify the signed-in user and their role.

There is no public sign-up. Employees are created by an admin or by a seed script. Admins are created by the seed script only.

## Employee page

- Current status: "Clocked in since 9:02" with a running timer, or "Clocked out".
- Two buttons, **Clock In** and **Clock Out**. Only one is enabled at a time. When clocked out, Clock In is active and Clock Out is grayed out. When clocked in, the reverse.
- Their own timesheet: every shift, grouped by week, with a total for each week. An employee may have several shifts in one day, for example before and after a lunch break.
- Employees only ever see their own data.

## Admin dashboard

- Who is clocked in right now, and since when.
- Every employee with their total hours for the current week, and a way to view past weeks or a date range.
- Per-employee detail: each shift with clock-in, clock-out, and duration.
- Clock out on an employee's behalf. People will forget to clock out, or will still be clocked in after 5:00 PM. An admin must be able to close an open shift by setting the clock-out time, or correct an existing one, and the system must record who changed it, when, and why.
- Add and deactivate employees. Deactivated employees cannot log in, but their history stays. Never display passwords.

## Clock rules

- An employee can clock in and out multiple times in a day.
- An employee cannot clock in before 8:00 AM.
- An employee cannot clock out after 5:00 PM. An employee still clocked in at 5:00 PM cannot close the shift themselves; an admin clocks them out.
- Both times are in the company's timezone (see Database).
- An employee cannot clock in while already clocked in.
- An employee cannot clock out without an open shift.
- Clock-out must be after clock-in.
- An employee can only clock themselves in and out.

The server must enforce these on its own. The grayed-out button is a convenience for the user, not a security measure. Assume someone will send the request directly.

## Database

Use a hosted PostgreSQL database (Neon, Supabase, Railway, or similar). MongoDB is not allowed for this project. Design the schema yourself and use any query layer you like. Weekly totals must be computed by the database, not by looping over rows in JavaScript. Pick one timezone for the company and apply it everywhere. A shift that crosses midnight belongs to the day it started.

## Bonus features

### QR clock-in

After logging in, an employee sees a QR code that is personal to them. It encodes a link to your clock endpoint for that employee. Scanning it with a phone clocks them in or out, whichever applies, and the result shows on screen. The QR and the buttons must share the same server logic and rules, so clocking in by QR grays out the Clock In button exactly as pressing it would.

Accepted trade-off: the QR carries no expiring token, so anyone with a photo of it could clock that employee in. That is fine for this project.

### Live admin board

"Who is clocked in" updates on the admin dashboard without a refresh when anyone clocks in or out. Use WebSockets.

### Deployment

Deploy the app so it is reachable on the internet, with your hosted database. Keep the connection string only in the hosting provider's environment variables, never in the repository. If you deploy, demo the deployed app.

## Presentation

Each team presents its project to the class. The presentation is a maximum of **10 minutes for the whole team**. This is strictly enforced; you will be stopped at 10 minutes. Q&A afterward is not counted in the 10 minutes.

Demo the running app, not slides about it. Show both roles.

## Submission

One repository per team. At the top of the README.md:

- Team members
- The company's business you chose
- Live link, if deployed
- How to run locally, including the seed command
- Email and password of one admin account and one employee account, so your instructor can test both roles. These are test accounts, not real credentials.

Build it like ABC Holding is paying your team to solve its problem.

Good luck.
