# 👻 PhantomShare

**A secure, serverless temporary file & text sharing platform, built on AWS.**

PhantomShare lets users share files, text, and code snippets through unique links that automatically expire — or self-destruct after being viewed. Built on a cloud-native architecture, it leverages AWS serverless services for scalability, security, and zero server management.

📖 **Want the full build-from-scratch walkthrough?** See **[BUILD_GUIDE.md](./BUILD_GUIDE.md)** for step-by-step setup, deployment, and troubleshooting instructions.

---

## 🚀 Features

| | |
|---|---|
| 📁 | Secure file sharing |
| 📝 | Text sharing |
| 💻 | Code snippet sharing |
| 🔐 | Password-protected shares |
| 🔥 | Burn after view |
| ⏳ | Auto expiration via DynamoDB TTL |
| ☁️ | Direct S3 upload via pre-signed URLs |
| 📊 | View & download tracking |
| 🌍 | Global delivery via CloudFront |
| ⚡ | Fully serverless architecture |

---

## 🏗️ Architecture

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

> For the full request/response flow — including the DynamoDB Streams → Cleanup Lambda cycle that deletes expired files — see the [Architecture section of the Build Guide](./BUILD_GUIDE.md#1--system-architecture).

---

## 🛠 Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Lucide React

**Backend**
- AWS Lambda
- API Gateway
- DynamoDB
- Amazon S3
- CloudFront
- AWS SAM
- AWS SDK v3
- Node.js

---

## 📂 Project Structure

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

## ⚙️ Installation

**Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/PhantomShare.git
cd PhantomShare
```

**Install frontend dependencies**
```bash
npm install
```

**Install backend dependencies**
```bash
cd backend
npm install
```

---

## ▶️ Run Locally

**Frontend**
```bash
npm run dev
```

**Backend**
```bash
sam build
sam local start-api
```

---

## 🚀 Deployment

**Backend**
```bash
sam build
sam deploy --guided
```

**Frontend**
```bash
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

> 🔎 Need the detailed, screenshot-level version of these steps — including AWS IAM setup and SAM template internals? Check **[BUILD_GUIDE.md](./BUILD_GUIDE.md)**.

---

## 🔐 Security Features

- Password-protected shares
- Pre-signed upload URLs
- Pre-signed download URLs
- Automatic file deletion
- Automatic metadata cleanup
- IAM-based access control

---

## 📈 Future Enhancements

- User authentication
- Email sharing
- QR code sharing
- Multiple file upload
- File preview
- Drag & drop upload
- Share analytics dashboard
- Mobile responsive UI

---

## 👨‍💻 Author

**Darshan Hulamani**
- GitHub: [github.com/Darshan-Hulamani](https://github.com/Darshan-Hulamani)
- LinkedIn: [linkedin.com/in/darshan-hulamani](https://www.linkedin.com/in/darshan-hulamani)

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
