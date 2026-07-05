# PhantomShare: Complete Step-by-Step Build & Deployment Guide

This guide details how to build and deploy **PhantomShare**—a serverless, temporary content-sharing platform—from scratch. 

# Author: **[Darshan Hulamani](linkedin.com/in/darshan-hulamani)**

---

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Phase 1: AWS IAM Credentials Setup](#3-phase-1-aws-iam-credentials-setup)
4. [Phase 2: Frontend Setup (React + Vite)](#4-phase-2-frontend-setup-react--vite)
5. [Phase 3: Serverless Backend Setup (AWS SAM)](#5-phase-3-serverless-backend-setup-aws-sam)
6. [Phase 4: Production Build & Deployment](#6-phase-4-production-build--deployment)
7. [Phase 5: Key Troubleshooting & Operations](#7-phase-5-key-troubleshooting--operations)

---

## 1. System Architecture

PhantomShare is built using a fully serverless, cloud-native architecture on AWS to remain cost-free under the AWS Free Tier while staying globally resilient and fast:

```
                  +-----------------------+
                  |      Web Browser      |
                  +-----------+-----------+
                              |
       +----------------------+----------------------+
       | (Load Static Webpage)                       | (API Calls / Uploads)
       v                                             v
+------+------+     +------------------+     +-------+-------+
|  CloudFront |  | S3 Frontend Buck |     |  API Gateway  |
+-------------+     +------------------+     +-------+-------+
                                                     |
                                                     v
                                             +-------+-------+
                                             |  Core Lambda  |
                                             +---+---+---+---+
                                                 |   |   |
                    +----------------------------+   |   +----------------------------+
                    v                                v                                v
            +-------+-------+                +-------+-------+                +-------+-------+
            |  DynamoDB DB  |                |   S3 Uploads  |                |  Pre-Signed   |
            | (Share Meta)  |                |  (Raw Files)  |                |  Upload URL   |
            +-------+-------+                +---------------+                +---------------+
                    |
                    | (TTL / Delete Event)
                    v
            +-------+-------+
            |  DDB Streams  |
            +-------+-------+
                    |
                    v
            +-------+-------+
            | Cleanup Lambda| ---> [Delete file from S3 Uploads]
            +---------------+
```

---

## 2. Prerequisites

You must install the following software on your local environment:
1. **Node.js (v18+)**: [Download Node.js](https://nodejs.org/)
2. **AWS CLI**: [Download AWS CLI MSI Installer](https://awscli.amazonaws.com/AWSCLIV2.msi)
3. **AWS SAM CLI**: [Download AWS SAM CLI MSI Installer](https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-x86_64.msi)

Verify installations in your terminal:
```powershell
node --version
npm --version
aws --version
sam --version
```

---

## 3. Phase 1: AWS IAM Credentials Setup

Before running local builds and AWS commands, you must configure credentials:

1. **Log in** to your [AWS Management Console](https://console.aws.amazon.com/).
2. Search for **IAM** (Identity and Access Management).
3. Click **Users** -> **Create user**.
   - **User name**: `phantomshare-admin`
   - **Access type**: Programmatic access (check "Provide user access to AWS Management Console" if you want web access too).
4. On the permissions page, select **Attach policies directly**. Search for and check **`AdministratorAccess`**. Click Next -> Create.
5. Open your newly created user, go to the **Security credentials** tab, and click **Create access key**.
6. Select **Command Line Interface (CLI)**, create the keys, and **download the CSV file** containing:
   - `Access Key ID`
   - `Secret Access Key`
7. In your computer terminal (PowerShell or Command Prompt), configure your credentials:
   ```powershell
   aws configure
   ```
   Provide the credentials as prompted:
   - **AWS Access Key ID**: (Paste your Access Key ID)
   - **AWS Secret Access Key**: (Paste your Secret Access Key)
   - **Default region name**: `us-east-1` (recommended)
   - **Default output format**: `json`

---

## 4. Phase 2: Frontend Setup (React + Vite)

### Project Initialization
Create a folder named `PhantomShare`, initialize a Vite React template, and install packages:

```powershell
npx -y create-vite@latest PhantomShare --template react
cd PhantomShare
npm install
npm install lucide-react qrcode.react
```

### Configuration Files

#### `vite.config.js`
Configure Vite to launch local servers on port 3000:
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
```

#### `src/config.js`
Store your API gateway URL.
```javascript
// Replace the URL with your actual API Gateway Endpoint URL from SAM deployment
export const API_URL = "https://2xrzlgt2gb.execute-api.us-east-1.amazonaws.com"; 
```

#### `src/components/CodeEditor.jsx`
Our syntax-highlighted editor has a multi-language tokenizer and a dynamic selector:
```javascript
import { Code2 } from "lucide-react";
import { useMemo, useState } from "react";

const starter = `function expireShare(share) {
  if (share.burnAfterView && share.views > 0) {
    return "expired";
  }
  return Date.now() > share.expiresAt ? "expired" : "active";
}`;

const languages = [
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "python", label: "Python", ext: "py" },
  { id: "html", label: "HTML", ext: "html" },
  { id: "css", label: "CSS", ext: "css" },
  { id: "json", label: "JSON", ext: "json" }
];

const keywordsMap = {
  javascript: new Set(["const", "let", "var", "return", "if", "else", "function", "async", "await", "import", "export", "class", "new", "true", "false"]),
  python: new Set(["def", "class", "return", "if", "elif", "else", "import", "from", "as", "for", "in", "while", "try", "except", "print", "True", "False", "None"]),
  html: new Set(["doctype", "html", "head", "body", "div", "span", "p", "a", "button", "input", "label", "section", "style", "script"]),
  css: new Set(["margin", "padding", "background", "color", "border", "display", "flex", "position", "width", "height", "font", "grid"]),
  json: new Set(["true", "false", "null"])
};

function highlight(code, langId) {
  const safeCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const keywords = keywordsMap[langId] || keywordsMap.javascript;

  return safeCode.replace(
    /(".*?"|'.*?'|`.*?`|\b\d+\b|\b[a-zA-Z_]\w*\b)/g,
    (match) => {
      if (match.startsWith('"') || match.startsWith("'") || match.startsWith('`')) {
        return `<span class="token-string">${match}</span>`;
      }
      if (/^\d+$/.test(match)) {
        return `<span class="token-number">${match}</span>`;
      }
      if (keywords.has(match)) {
        return `<span class="token-keyword">${match}</span>`;
      }
      return match;
    }
  );
}

export default function CodeEditor({ value, onChange }) {
  const [langId, setLangId] = useState("javascript");
  const code = value !== undefined && value !== null ? value : starter;
  const highlighted = useMemo(() => highlight(code, langId), [code, langId]);
  const currentLang = useMemo(() => languages.find(l => l.id === langId), [langId]);

  return (
    <div className="code-editor">
      <div className="editor-toolbar">
        <span>
          <Code2 size={16} />
          snippet.{currentLang.ext}
        </span>
        <select 
          className="lang-select"
          value={langId} 
          onChange={(e) => setLangId(e.target.value)}
          aria-label="Select programming language"
        >
          {languages.map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
      <div className="editor-body">
        <pre aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlighted }} />
        <textarea
          aria-label="Code snippet"
          spellCheck="false"
          value={code}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
    </div>
  );
}
```

#### `src/pages/CreateSharePage.jsx`
Extracts files or text, posts metadata to `/shares`, receives an S3 Pre-signed URL, and directly uploads files:
```javascript
import { useState } from "react";
import { API_URL } from "../config.js";

// ... Inside React Component
const generate = async () => {
  setIsGenerating(true);
  try {
    const payload = {
      type: mode, // 'file', 'text', or 'code'
      expiresIn: 86400, // 24 Hours in seconds
      burnOnView: burnEnabled
    };

    if (mode === "file") {
      payload.fileName = file.name;
      payload.fileSize = file.size;
      payload.mimeType = file.type || "application/octet-stream";
    } else {
      payload.content = textContent;
    }

    // 1. Send metadata to database via lambda
    const res = await fetch(`${API_URL}/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to register share");
    const data = await res.json();
    const { shareId, uploadUrl } = data;

    // 2. Direct S3 Upload if it's a binary file
    if (mode === "file" && uploadUrl) {
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file
      });
    }
    
    // Redirect / notify of success...
  } catch (err) {
    console.error(err);
  } finally {
    setIsGenerating(false);
  }
};
```

---

## 5. Serverless Backend Setup (AWS SAM)

Create a subfolder `backend` inside the project root:
```powershell
mkdir backend
cd backend
```

### Backend Dependency Setup
Create `backend/package.json`:
```json
{
  "name": "phantomshare-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.500.0",
    "@aws-sdk/client-s3": "^3.500.0",
    "@aws-sdk/lib-dynamodb": "^3.500.0",
    "@aws-sdk/s3-request-presigner": "^3.500.0",
    "@aws-sdk/util-dynamodb": "^3.500.0",
    "bcryptjs": "^2.4.3"
  }
}
```

### Core SAM Template: `template.yaml`
This defines your DynamoDB table, S3 Buckets, Lambdas (API + Cleanup), API Gateway, and CloudFront.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: PhantomShare Backend Service - Serverless Temporary Content Sharing Platform

Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, prod]
    Description: Environment stage

Globals:
  Function:
    Timeout: 30
    MemorySize: 256
    Runtime: nodejs20.x
    LoggingConfig:
      LogFormat: JSON

Resources:
  # 1. DynamoDB Table
  SharesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub phantomshare-metadata-${Environment}
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: ShareId
          AttributeType: S
      KeySchema:
        - AttributeName: ShareId
          KeyType: HASH
      TimeToLiveSpecification:
        AttributeName: expiresAt
        Enabled: true
      StreamSpecification:
        StreamViewType: OLD_IMAGE

  # 2. S3 Bucket for Uploads
  UploadsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub phantomshare-uploads-${Environment}-${AWS::AccountId}
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders: ['*']
          - AllowedMethods: [GET, PUT, POST, DELETE, HEAD]
          - AllowedOrigins: ['*']
            MaxAge: 3600

  # 3. HTTP API Gateway
  HttpApiGateway:
    Type: AWS::Serverless::HttpApi
    Properties:
      Name: !Sub phantomshare-api-${Environment}
      CorsConfiguration:
        AllowHeaders: ['Content-Type', 'Authorization']
        AllowMethods: [GET, POST, OPTIONS]
        AllowOrigins: ['*']

  # 4. Core API Lambda
  CoreApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub phantomshare-core-api-${Environment}
      Handler: src/handlers/api.handler
      CodeUri: .
      Environment:
        Variables:
          TABLE_NAME: !Ref SharesTable
          BUCKET_NAME: !Ref UploadsBucket
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref SharesTable
        - S3CrudPolicy:
            BucketName: !Ref UploadsBucket
      Events:
        ProxyRoute:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApiGateway
            Path: /{proxy+}
            Method: ANY

  # 5. Cleanup Lambda (DynamoDB Stream Trigger)
  CleanupFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub phantomshare-cleanup-${Environment}
      Handler: src/handlers/cleanup.handler
      CodeUri: .
      Environment:
        Variables:
          BUCKET_NAME: !Ref UploadsBucket
      Policies:
        - S3CrudPolicy:
            BucketName: !Ref UploadsBucket
      Events:
        DdbStream:
          Type: DynamoDB
          Properties:
            Stream: !GetAtt SharesTable.StreamArn
            StartingPosition: TRIM_HORIZON
            BatchSize: 10
            FilterCriteria:
              Filters:
                - Pattern: '{"eventName": ["REMOVE"]}'

  # 6. S3 Bucket for Frontend
  FrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub phantomshare-frontend-${Environment}-${AWS::AccountId}
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html

  FrontendBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref FrontendBucket
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: PublicReadGetObject
            Effect: Allow
            Principal: '*'
            Action: 's3:GetObject'
            Resource: !Sub 'arn:aws:s3:::${FrontendBucket}/*'

  # 7. CloudFront Distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        DefaultRootObject: index.html
        Origins:
          - Id: FrontendS3Origin
            DomainName: !GetAtt FrontendBucket.RegionalDomainName
            S3OriginConfig:
              OriginAccessIdentity: ''
          - Id: ApiGatewayOrigin
            DomainName: !Sub "${HttpApiGateway}.execute-api.${AWS::Region}.amazonaws.com"
            CustomOriginConfig:
              HTTPPort: 80
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
        DefaultCacheBehavior:
          TargetOriginId: FrontendS3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods: [GET, HEAD, OPTIONS]
          CachedMethods: [GET, HEAD]
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none

Outputs:
  ApiEndpoint:
    Description: HTTP API Gateway Endpoint URL
    Value: !Sub https://${HttpApiGateway}.execute-api.${AWS::Region}.amazonaws.com
  UploadsBucketName:
    Description: Name of the uploads S3 bucket
    Value: !Ref UploadsBucket
  FrontendBucketName:
    Description: Name of the frontend S3 bucket
    Value: !Ref FrontendBucket
  CloudFrontURL:
    Description: Public CloudFront CDN URL (Use this to access PhantomShare publicly!)
    Value: !Sub https://${CloudFrontDistribution}.cloudfront.net
```

### Backend Implementation Code

#### `backend/src/services/db.js`
```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export async function getShare(shareId) {
  try {
    const result = await docClient.send(
      new GetCommand({ TableName: tableName, Key: { ShareId: shareId } })
    );
    return result.Item;
  } catch (error) {
    console.error("DynamoDB GetShare Error:", error);
    throw error;
  }
}

export async function createShare(share) {
  try {
    await docClient.send(
      new PutCommand({ TableName: tableName, Item: share })
    );
    return share;
  } catch (error) {
    console.error("DynamoDB CreateShare Error:", error);
    throw error;
  }
}

export async function incrementViews(shareId) {
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { ShareId: shareId },
        UpdateExpression: "SET viewCount = if_not_exists(viewCount, :zero) + :inc",
        ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
        ReturnValues: "UPDATED_NEW"
      })
    );
    return result.Attributes.viewCount;
  } catch (error) {
    console.error("DynamoDB IncrementViews Error:", error);
    throw error;
  }
}

export async function incrementDownloads(shareId) {
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { ShareId: shareId },
        UpdateExpression: "SET downloadCount = if_not_exists(downloadCount, :zero) + :inc",
        ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
        ReturnValues: "UPDATED_NEW"
      })
    );
    return result.Attributes.downloadCount;
  } catch (error) {
    console.error("DynamoDB IncrementDownloads Error:", error);
    throw error;
  }
}

export async function deleteShare(shareId) {
  try {
    await docClient.send(
      new DeleteCommand({ TableName: tableName, Key: { ShareId: shareId } })
    );
  } catch (error) {
    console.error("DynamoDB DeleteShare Error:", error);
    throw error;
  }
}
```

#### `backend/src/services/s3.js`
```javascript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({});
const bucketName = process.env.BUCKET_NAME;

export async function getUploadPresignedUrl(key, mimeType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: mimeType,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 600 });
}

export async function getDownloadPresignedUrl(key, filename) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}

export async function deleteFile(key) {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    console.log(`Successfully deleted file from S3: ${key}`);
  } catch (error) {
    console.error(`Error deleting file from S3 (${key}):`, error);
    throw error;
  }
}
```

#### `backend/src/utils/auth.js`
```javascript
import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
}
```

#### `backend/src/handlers/api.js`
```javascript
import crypto from "crypto";
import { getShare, createShare, incrementViews, incrementDownloads, deleteShare } from "../services/db.js";
import { getUploadPresignedUrl, getDownloadPresignedUrl } from "../services/s3.js";
import { hashPassword, verifyPassword } from "../utils/auth.js";

function generateShareId() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(8);
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

function respond(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export async function handler(event) {
  console.log("Received event:", JSON.stringify(event));
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  if (method === "OPTIONS") {
    return respond(200, { message: "CORS preflight OK" });
  }

  try {
    // ROUTE: POST /shares
    if (method === "POST" && path === "/shares") {
      const body = JSON.parse(event.body || "{}");
      const { type, title, content, fileName, fileSize, mimeType, expiresIn, password, burnOnView } = body;

      if (!type || !["text", "code", "file"].includes(type)) {
        return respond(400, { error: "Invalid type." });
      }

      if (type !== "file" && !content) {
        return respond(400, { error: "Content is required." });
      }

      const shareId = generateShareId();
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + (expiresIn || 86400);

      const shareItem = {
        ShareId: shareId,
        type,
        title: title || (type === "file" ? fileName : "Untitled Share"),
        createdAt: now,
        expiresAt,
        burnOnView: !!burnOnView,
        viewCount: 0,
        downloadCount: 0
      };

      if (password) {
        shareItem.passwordHash = await hashPassword(password);
      }

      let uploadUrl = null;
      if (type === "file") {
        const fileKey = `uploads/${shareId}/${fileName}`;
        shareItem.s3Key = fileKey;
        shareItem.fileName = fileName;
        shareItem.fileSize = fileSize || 0;
        shareItem.mimeType = mimeType;
        uploadUrl = await getUploadPresignedUrl(fileKey, mimeType);
      } else {
        shareItem.content = content;
      }

      await createShare(shareItem);
      return respond(201, { shareId, expiresAt, uploadUrl, isPasswordProtected: !!password });
    }

    // ROUTE: GET /shares/{id}
    const shareMatch = path.match(/^\/shares\/([a-zA-Z0-9]{8})$/);
    if (method === "GET" && shareMatch) {
      const shareId = shareMatch[1];
      const share = await getShare(shareId);

      if (!share) return respond(404, { error: "Share not found or expired." });

      const updatedViews = await incrementViews(shareId);
      share.viewCount = updatedViews;

      if (share.passwordHash) {
        return respond(200, {
          shareId, type: share.type, title: share.title, fileName: share.fileName,
          fileSize: share.fileSize, mimeType: share.mimeType, expiresAt: share.expiresAt,
          burnOnView: share.burnOnView, isPasswordProtected: true, viewCount: share.viewCount,
          downloadCount: share.downloadCount
        });
      }

      const responseBody = {
        shareId, type: share.type, title: share.title, expiresAt: share.expiresAt,
        burnOnView: share.burnOnView, isPasswordProtected: false, viewCount: share.viewCount,
        downloadCount: share.downloadCount
      };

      if (share.type === "file") {
        responseBody.fileName = share.fileName;
        responseBody.fileSize = share.fileSize;
        responseBody.mimeType = share.mimeType;
      } else {
        responseBody.content = share.content;
      }

      if (share.burnOnView) await deleteShare(shareId);

      return respond(200, responseBody);
    }

    // ROUTE: POST /shares/{id}/verify
    const verifyMatch = path.match(/^\/shares\/([a-zA-Z0-9]{8})\/verify$/);
    if (method === "POST" && verifyMatch) {
      const shareId = verifyMatch[1];
      const { password } = JSON.parse(event.body || "{}");
      const share = await getShare(shareId);

      if (!share) return respond(404, { error: "Share not found." });

      const isValid = await verifyPassword(password, share.passwordHash);
      if (!isValid) return respond(401, { error: "Incorrect password." });

      const responseBody = { authorized: true, type: share.type };
      if (share.type === "file") {
        responseBody.fileName = share.fileName;
        responseBody.fileSize = share.fileSize;
        responseBody.mimeType = share.mimeType;
        responseBody.downloadUrl = await getDownloadPresignedUrl(share.s3Key, share.fileName);
      } else {
        responseBody.content = share.content;
      }

      if (share.burnOnView) await deleteShare(shareId);

      return respond(200, responseBody);
    }

    // ROUTE: POST /shares/{id}/download
    const downloadMatch = path.match(/^\/shares\/([a-zA-Z0-9]{8})\/download$/);
    if (method === "POST" && downloadMatch) {
      const shareId = downloadMatch[1];
      const share = await getShare(shareId);

      if (!share || share.type !== "file") return respond(404, { error: "Share not found." });
      if (share.passwordHash) return respond(403, { error: "Password-protected." });

      await incrementDownloads(shareId);
      const downloadUrl = await getDownloadPresignedUrl(share.s3Key, share.fileName);
      return respond(200, { downloadUrl });
    }

    return respond(404, { error: "Route not found" });
  } catch (error) {
    console.error(error);
    return respond(500, { error: "Internal Server Error" });
  }
}
```

#### `backend/src/handlers/cleanup.js`
```javascript
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { deleteFile } from "../services/s3.js";

export async function handler(event) {
  console.log("Received Stream Event:", JSON.stringify(event));

  for (const record of event.Records) {
    if (record.eventName === "REMOVE") {
      try {
        const oldImage = unmarshall(record.dynamodb.OldImage);
        console.log(`Processing REMOVE event for ShareId: ${oldImage.ShareId}`);

        if (oldImage.type === "file" && oldImage.s3Key) {
          console.log(`Triggering S3 delete for key: ${oldImage.s3Key}`);
          await deleteFile(oldImage.s3Key);
        }
      } catch (error) {
        console.error("Failed to process DynamoDB stream record cleanup:", error);
      }
    }
  }
  return { message: "Stream processing complete." };
}
```

---

## 6. Phase 4: Production Build & Deployment

### Step 1: Build and Deploy the Backend using SAM
Go to the `backend` folder and trigger building:
```powershell
cd backend
sam build
sam deploy --guided
```
Accept default settings and confirm deployments.

Once completed, **save these outputs** from the screen:
- **`ApiEndpoint`**: Your live API URL (e.g. `https://2xrzlgt2gb.execute-api.us-east-1.amazonaws.com`)
- **`FrontendBucketName`**: Your React host bucket (e.g. `phantomshare-frontend-dev-575620421078`)
- **`CloudFrontURL`**: Your public CDN domain (e.g. `https://d2kre72e4hwpqr.cloudfront.net`)

### Step 2: Configure and Build Frontend React
1. Open `src/config.js` and paste your **`ApiEndpoint`** URL as the value for `API_URL`.
2. Generate production assets:
   ```powershell
   npm run build
   ```
   This generates compiled assets inside the `dist/` directory.

### Step 3: Upload Frontend Assets to S3
Upload assets directly into the S3 bucket using the AWS CLI. Replace `YOUR_FRONTEND_BUCKET_NAME` with the `FrontendBucketName` output from Step 1:
```powershell
aws s3 sync dist/ s3://YOUR_FRONTEND_BUCKET_NAME --delete
```

### Step 4: Invalidate CloudFront CDN Cache
To force CloudFront's global edge nodes to refresh and load the new webpage contents, trigger an invalidation. Replace `YOUR_DISTRIBUTION_ID` with your CloudFront ID (e.g. `E2WVNS4*******`):
```powershell
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## 7. Phase 5: Key Troubleshooting & Operations

### 1. View Lambda API Logs in Real-time
If you run into backend errors or want to debug lambda runtime properties, tail the live CloudWatch logs:
```powershell
sam logs -n CoreApiFunction --stack-name phantomshare-backend-dev --tail
```

### 2. AWS Free Tier Limits & Zero Cost Operations
All components fit under the AWS Free Tier limitations:
- **AWS Lambda**: 1 Million requests free per month.
- **DynamoDB**: 25 GB of storage free.
- **S3**: 5 GB of standard storage free.
- **CloudFront**: 1 TB of outbound data transfer free per month.
As long as you stay within these thresholds, your project hosting cost is **$0.00 / month**.
#   P h a n t o m - S h a r e  
 #   P h a n t o m - S h a r e  
 