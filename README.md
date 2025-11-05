# Aryaman Sharma - Personal Portfolio & CMS

This is the source code for my personal portfolio, a fully dynamic React application powered by a Supabase backend and a custom-built content management system (CMS).

**Visit the live site: [https://aryaman9999.github.io/aryamansharma/](https://aryaman9999.github.io/aryamansharma/)**

---

## 🚀 Key Features

This project is more than a static site. It's a full-stack application with a decoupled architecture.

* **Full Custom CMS:** A secure, password-protected admin dashboard built from scratch with React.
* **Dynamic Content Management:** All site content—including the Hero section, About page, Projects, Career Experience, and Blog—is fetched from a PostgreSQL database and can be edited live from the admin panel.
* **Secure Role-Based Auth:** The project uses Supabase Row Level Security (RLS) and a custom `user_roles` table to ensure that only authenticated users with the `admin` role can access the dashboard or modify content.
* **File Storage Integration:** The admin dashboard supports uploading files (like resumes and project images) directly to Supabase Storage. The public URLs are then saved to the database.
* **Modern Frontend:** Built with React, Vite, and TypeScript for a fast, type-safe development experience.
* **Beautifully Styled:** Uses Tailwind CSS and shadcn/ui for a clean, responsive, and modern design.

## 🛠 Tech Stack

* **Frontend:** React, Vite, TypeScript, React Router, Tailwind CSS, shadcn/ui.
* **Backend:** Supabase (PostgreSQL, Auth, Storage).
* **Deployment:**
    * Frontend: **GitHub Pages** (deployed automatically via GitHub Actions).
    * Backend: **Supabase** (self-hosted on the free tier).

## 🏛 Project Architecture

This portfolio operates on a decoupled architecture:

1.  **Frontend (GitHub Pages):** A static build of the React application is hosted on GitHub Pages. This makes it fast and free to serve.
2.  **Backend (Supabase):** When a user visits the site, the React app makes API calls to the self-hosted Supabase project to fetch all dynamic content.
3.  **Admin Panel:** When I navigate to the `/admin-login` route, the React app provides a login form. On successful login, it uses a secure token to fetch and send data to the Supabase backend, allowing me to manage all site content.
