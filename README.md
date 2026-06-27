# AI Digital Wardrobe Stylist

An AI-powered web application that helps users organize their wardrobe digitally and receive intelligent outfit recommendations. Users can upload images of their clothing items, categorize them, and generate stylish outfit combinations using Google Gemini AI.

---

# Features

* Upload clothing images
* Categorize clothes as **Top**, **Bottom**, or **Shoes**
* Store clothing color and name
* Maintain a digital wardrobe
* Generate AI-powered outfit recommendations
* Receive fashion styling tips from Google Gemini
* Display the recommended outfit using the uploaded clothing images

---

# Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)

### Backend

* Node.js
* Express.js

### Database

* MySQL

### AI

* Google Gemini API

### Other Libraries

* Multer
* dotenv
* CORS

---

#  Project Structure

```text
AI-Digital-Wardrobe/
│
├── backend/
│   ├── uploads/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── assets/
│
└── README.md
```

---

#  Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Digital-Wardrobe
```

---

## 2. Install Dependencies

```bash
cd backend
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=5000
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

## 4. Configure MySQL Database

Create the following table.

```sql
CREATE TABLE clothing_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    category VARCHAR(50),
    color VARCHAR(50),
    image_path VARCHAR(255)
);
```

Update the database credentials in `db.js`.

---

#  Running the Project

Start the backend server.

```bash
node server.js
```

or

```bash
npm start
```

Open the frontend in your browser.

```
http://localhost:5000
```

---

#  API Endpoints

## Upload Clothing Item

**POST**

```
/upload
```

### Form Data

| Field    | Type    | Description        |
| -------- | ------- | ------------------ |
| image    | File    | Clothing image     |
| name     | String  | Clothing name      |
| category | String  | top, bottom, shoes |
| color    | String  | Clothing color     |
| user_id  | Integer | User ID            |

### Response

```json
{
  "message": "Item uploaded successfully"
}
```

---

## Generate AI Outfit

**GET**

```
/generate-ai/:userId
```

Example

```
GET /generate-ai/1
```

### Response

```json
{
  "top": {
    "id": 1,
    "name": "White Shirt",
    "category": "top",
    "color": "White",
    "image_path": "/uploads/white-shirt.jpg"
  },
  "bottom": {
    "id": 2,
    "name": "Blue Jeans",
    "category": "bottom",
    "color": "Blue",
    "image_path": "/uploads/blue-jeans.jpg"
  },
  "shoes": {
    "id": 3,
    "name": "White Sneakers",
    "category": "shoes",
    "color": "White",
    "image_path": "/uploads/sneakers.jpg"
  },
  "tip": "The white shirt and blue jeans create a classic casual look, while the sneakers complete the outfit with a clean finish."
}
```

---

#  AI Recommendation Workflow

1. User uploads clothing images.
2. Clothing details are stored in the MySQL database.
3. Uploaded images are saved in the `uploads` folder.
4. When the user clicks **Generate AI Outfit**, all wardrobe items are retrieved.
5. Google Gemini receives the wardrobe details.
6. Gemini selects:

   * One Top
   * One Bottom
   * One Pair of Shoes
7. The backend maps the selected IDs to their corresponding images.
8. The frontend displays the recommended outfit along with an AI-generated styling tip.

---

#  Application Workflow

1. Open the application.
2. Upload clothing items with:

   * Name
   * Category
   * Color
   * Image
3. Store multiple clothing items in the wardrobe.
4. Click **Generate AI Outfit**.
5. View:

   * Recommended Top
   * Recommended Bottom
   * Recommended Shoes
   * Styling Tip

---

#  Dependencies

```
express
cors
dotenv
multer
mysql2
@google/generative-ai
```

Install using:

```bash
npm install
```

---

#  Error Handling

The application handles:

* Missing image uploads
* Invalid form data
* Database connection failures
* AI response parsing errors
* AI service failures
* Less than three wardrobe items uploaded

---

#  Future Enhancements

* User authentication and login
* Automatic clothing detection using image recognition
* Weather-based outfit recommendations
* Occasion-specific outfit suggestions
* Seasonal wardrobe planning
* Favorite outfit collections
* Search and filter wardrobe items
* AI color matching and fashion trend recommendations

---

#  Author

**Adithya K S**

An AI-powered Digital Wardrobe application built using **HTML, CSS, JavaScript, Node.js, Express.js, MySQL, and Google Gemini AI**.
