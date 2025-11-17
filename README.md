# 🌐 GameTrackr Web (Frontend)

This is the frontend client for the GameTrackr project, a full-stack game tracking application.

This client is built with **React (TypeScript)** and **Material-UI (MUI)**. It consumes the custom [GameTrackr API](https://github.com/your-username/GameTrackr/tree/main/GameTrackr-api) to provide a rich, interactive user experience.

---

## ✨ Key Features

* **Full Authentication Flow:** Complete UI for Login, Register, and Profile editing.
* **Global State Management:** Uses React Context (`AuthContext`, `GameContext`) to manage user state and game lists across the app.
* **Protected Routes:** Client-side routing (`React Router v6+`) protects pages like "Edit Profile" from unauthenticated users.
* **Infinite Scrolling Gallery:** The home page (`HomePage`) features an infinite-scrolling gallery of games loaded from the API.
* **Filtering & Sorting:** Gallery can be sorted and filtered by platform, release date, and rating.
* **State Persistence:** The `GameContext` preserves the user's scroll position and filters when navigating away and returning.
* **Dynamic Wishlist:** Users can add/remove games from their wishlist directly from game cards or detail pages.
* **Dynamic Profiles:** Public user profiles (`/users/<username>`) display user info and a preview of their wishlist.
* **Full Wishlist Page:** A dedicated, paginated page (`/users/<username>/wishlist`) for viewing a full wishlist.
* **Modern UI:** Built with **Material-UI (MUI)** using the modern **Grid v2** syntax.

---

## 💻 Tech Stack

* **Framework/Library:** React 18+
* **Language:** TypeScript
* **Bundler:** Vite
* **UI Kit:** Material-UI (MUI v6/v7)
* **Routing:** React Router v6+
* **HTTP Client:** Axios
* **State Management:** React Context

---

## ⚙️ Setup and Installation

### 1. Prerequisites

* Node.js (v18+) and npm/yarn.
* The [GameTrackr API (Backend)](https://github.com/ch1tg/GameTrackr-api) **must be running** (usually at `http://localhost:80`).

### 2. Configuration

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/GameTrackr.git](https://github.com/your-username/GameTrackr.git)
    cd GameTrackr/gametrackr-web
    ```

2.  **Create the Environment File:**
    This project uses Vite, which reads `.env` files. The only variable needed is the API URL.
    
    Create a file named `.env.local` in the `gametrackr-web/` directory.

3.  **Add Environment Variable:**
    ```ini
    # The URL where the backend API is running
    VITE_API_BASE_URL=http://localhost:80/api
    ```
    *(Our `apiClient` (`src/api/index.ts`) is configured to read this variable).*

### 3. Running the Application

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
    *(Or `yarn install`)*

2.  **Run the Dev Server:**
    ```bash
    npm run dev
    ```

### 4. Accessing the App

* **App URL:** `http://localhost:5173` (Vite's default port)
