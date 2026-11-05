# StudioSpace Server 🚀

**StudioSpace** is a RESTful API built with Express.js and MongoDB for a creative workspace and studio booking marketplace. It powers the StudioSpace platform, allowing users to discover studios, manage their listings, and book creative spaces.

## 🌐 Live API

- **Backend API:** https://studio-space-server-tau.vercel.app/
- **Frontend:** https://studio-space-client-one.vercel.app/
- **GitHub Repository:** https://github.com/md-saim850/StudioSpace-server

## ✨ Features

- **Studio Management** – Create, retrieve, update, and delete studio listings.
- **Studio Discovery** – Browse studios with category filtering and result limits.
- **Category Management** – Retrieve available studio categories.
- **Booking System** – Create and manage studio bookings.
- **Booking Conflict Detection** – Prevent overlapping confirmed bookings for the same studio and date.
- **My Listings** – Retrieve studios created by the authenticated user.
- **My Bookings** – Retrieve bookings belonging to the authenticated user.
- **Authentication & Authorization** – Verify JWT tokens using Better Auth's JWKS endpoint.
- **MongoDB Integration** – Store and manage studio, category, and booking data.
- **CORS Configuration** – Allow requests from authorized frontend origins.
- **Vercel Deployment** – Deploy the API as a serverless application.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | Backend framework |
| MongoDB | NoSQL database |
| MongoDB Driver | Database connectivity |
| Better Auth / JOSE | JWT verification |
| CORS | Cross-origin resource sharing |
| Dotenv | Environment variable management |
| Nodemon | Development server |

## 📁 Project Structure

```text
StudioSpace-server/
│
├── index.js
├── package.json
├── package-lock.json
├── vercel.json
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/md-saim850/StudioSpace-server.git
```

### 2. Navigate to the project directory

```bash
cd StudioSpace-server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

**Environment Variables**

| Variable | Description |
|---|---|
| `PORT` | Local server port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL used for Better Auth JWKS verification |

For production, configure these variables in your Vercel project settings.

### 5. Run the development server

```bash
npx nodemon index.js
```

Or run directly:

```bash
node index.js
```

The API will be available at:

```text
http://localhost:5000
```

## 🔐 Authentication

StudioSpace uses JWT-based authentication integrated with Better Auth.

Protected endpoints require a valid Bearer token in the request headers.

**Request Header:**

```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

The server verifies incoming tokens using the Better Auth JSON Web Key Set (JWKS) endpoint:

```text
{CLIENT_URL}/api/auth/jwks
```

Unauthenticated requests to protected endpoints return `401 Unauthorized`.

## 📡 API Documentation

**Base URL**

```text
https://studio-space-server-tau.vercel.app
```

### 1. General Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check API status |
| GET | `/category` | Get all studio categories |

### 2. Studio Routes

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/studios` | No | Get all studios |
| GET | `/studios/:id` | No | Get a specific studio |
| POST | `/add-studio` | Yes | Create a studio listing |
| PUT | `/studios/:id` | Yes | Update a studio listing |
| GET | `/my-listings` | Yes | Get user's studio listings |
| DELETE | `/delete-listings/:id` | Yes | Delete a studio listing |

**Studio Filtering**

Get studios by category:

```http
GET /studios?category=Photo Studio
```

Limit the number of results:

```http
GET /studios?limit=6
```

Combine both:

```http
GET /studios?category=Photo Studio&limit=6
```

### 3. Booking Routes

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/my-booking` | Yes | Get user's bookings |
| POST | `/add-booking` | Yes | Create a booking |
| DELETE | `/delete-booking/:id` | No | Delete a booking |

**Booking Conflict Detection**

The API checks existing confirmed bookings before creating a new booking. If another confirmed booking overlaps with the requested time for the same studio and date, the API returns:

```json
{
  "message": "This studio is already booked during this time!"
}
```

HTTP Status: `409 Conflict`

## 🗄️ Database Structure

The application uses MongoDB with the following database:

```text
studio-space-db
│
├── studios
│
├── category
│
└── my-booking
```

### Collections

- **studios:** Stores studio information, ownership details, pricing, location, amenities, and descriptions.
- **category:** Stores available studio categories.
- **my-booking:** Stores booking information, studio details, user IDs, booking dates, and time slots.

## 🚀 Deployment

The backend is deployed on **Vercel**.

To deploy your own instance:

1. Push your project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables:
   - `MONGODB_URI`
   - `CLIENT_URL`
   - `PORT` (if required by your deployment configuration)
4. Deploy the project.
5. Update your frontend API URL to point to your deployed backend.

## 🔗 Frontend Integration

The StudioSpace frontend communicates with this backend through REST API requests.

Frontend repository and deployment:

- [StudioSpace Frontend](https://studio-space-client-one.vercel.app/)
- [StudioSpace Backend](https://github.com/md-saim850/StudioSpace-server)

## 👨‍💻 Author

**MD. Saim**

Full-Stack Web Developer

- GitHub: [@md-saim850](https://github.com/md-saim850)
- Portfolio: [mdsaim.vercel.app](https://mdsaim.vercel.app/)
- LinkedIn: [MD. Saim](https://www.linkedin.com/in/md-saim850)

---

⭐ If you find this project interesting, consider giving it a star!

**Built with ❤️ using Node.js, Express.js, and MongoDB.**