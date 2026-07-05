# 👻 PhantomShare

**PhantomShare** is a secure, serverless temporary file and text sharing platform built on AWS. It allows users to share files, text, and code snippets through unique links that automatically expire or self-destruct after being viewed.

Designed with a cloud-native architecture, PhantomShare leverages AWS Serverless services to provide scalability, security, and zero server management.

---

## 🚀 Features

- 📁 Secure File Sharing
- 📝 Text Sharing
- 💻 Code Snippet Sharing
- 🔐 Password-Protected Shares
- 🔥 Burn After View
- ⏳ Auto Expiration using DynamoDB TTL
- ☁️ Direct S3 Upload using Pre-signed URLs
- 📊 View & Download Tracking
- 🌍 Global Delivery using CloudFront
- ⚡ Fully Serverless Architecture

---

# 🏗️ Architecture

```
Client (React + Vite)
        │
        ▼
CloudFront CDN
        │
        ▼
   S3 Frontend Hosting
        │
        ▼
API Gateway
        │
        ▼
AWS Lambda
        │
 ┌──────┼─────────┐
 ▼      ▼         ▼
S3   DynamoDB   IAM
 │       │
 ▼       ▼
Temporary Files
Metadata + TTL
```

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React

## Backend

- AWS Lambda
- API Gateway
- DynamoDB
- Amazon S3
- CloudFront
- AWS SAM
- AWS SDK v3
- Node.js

---

# 📂 Project Structure

```
PhantomShare/
│
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── template.yaml
│
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/PhantomShare.git

cd PhantomShare
```

## Install Frontend

```bash
npm install
```

## Install Backend

```bash
cd backend

npm install
```

---

# ▶️ Run Locally

Frontend

```bash
npm run dev
```

Backend

```bash
sam build

sam local start-api
```

---

# 🚀 Deployment

Backend

```bash
sam build

sam deploy --guided
```

Frontend

```bash
npm run build

aws s3 sync dist/ s3://YOUR_BUCKET_NAME

aws cloudfront create-invalidation \
--distribution-id YOUR_DISTRIBUTION_ID \
--paths "/*"
```

---

# 🔐 Security Features

- Password Protected Shares
- Pre-signed Upload URLs
- Pre-signed Download URLs
- Automatic File Deletion
- Automatic Metadata Cleanup
- IAM Based Access Control

---

# 📈 Future Enhancements

- User Authentication
- Email Sharing
- QR Code Sharing
- Multiple File Upload
- File Preview
- Drag & Drop Upload
- Share Analytics Dashboard
- Mobile Responsive UI

---

# 👨‍💻 Author

**Darshan Hulamani**

- GitHub: https://github.com/Darshan-Hulamani
- LinkedIn: https://www.linkedin.com/in/darshan-hulamani

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
