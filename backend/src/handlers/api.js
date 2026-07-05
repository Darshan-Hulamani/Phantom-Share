import crypto from "crypto";
import { getShare, createShare, incrementViews, incrementDownloads, deleteShare } from "../services/db.js";
import { getUploadPresignedUrl, getDownloadPresignedUrl } from "../services/s3.js";
import { hashPassword, verifyPassword } from "../utils/auth.js";

// Helper to generate a secure random 8-character ID
function generateShareId() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(8);
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

// JSON Response helper
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

  // Handle CORS preflight options request
  if (method === "OPTIONS") {
    return respond(200, { message: "CORS preflight OK" });
  }

  try {
    // ROUTE: POST /shares
    if (method === "POST" && path === "/shares") {
      const body = JSON.parse(event.body || "{}");
      const { type, title, content, fileName, fileSize, mimeType, expiresIn, password, burnOnView } = body;

      if (!type || !["text", "code", "file"].includes(type)) {
        return respond(400, { error: "Invalid type. Must be 'text', 'code', or 'file'." });
      }

      if (type !== "file" && !content) {
        return respond(400, { error: "Content is required for text or code shares." });
      }

      const shareId = generateShareId();
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + (expiresIn || 86400); // Default 24h

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
        if (!fileName || !mimeType) {
          return respond(400, { error: "fileName and mimeType are required for file shares." });
        }
        // Unique S3 object key layout
        const fileKey = `uploads/${shareId}/${fileName}`;
        shareItem.s3Key = fileKey;
        shareItem.fileName = fileName;
        shareItem.fileSize = fileSize || 0;
        shareItem.mimeType = mimeType;

        // Generate pre-signed upload URL (expires in 10 minutes)
        uploadUrl = await getUploadPresignedUrl(fileKey, mimeType);
      } else {
        shareItem.content = content;
      }

      // Save to DynamoDB
      await createShare(shareItem);

      return respond(201, {
        shareId,
        expiresAt,
        uploadUrl,
        isPasswordProtected: !!password
      });
    }

    // ROUTE: GET /shares/{id}
    const shareMatch = path.match(/^\/shares\/([a-zA-Z0-9]{8})$/);
    if (method === "GET" && shareMatch) {
      const shareId = shareMatch[1];
      const share = await getShare(shareId);

      if (!share) {
        return respond(404, { error: "Share not found or expired." });
      }

      // Increment view count
      const updatedViews = await incrementViews(shareId);
      share.viewCount = updatedViews;

      // If password-protected, withhold sensitive data
      if (share.passwordHash) {
        return respond(200, {
          shareId,
          type: share.type,
          title: share.title,
          fileName: share.fileName,
          fileSize: share.fileSize,
          mimeType: share.mimeType,
          expiresAt: share.expiresAt,
          burnOnView: share.burnOnView,
          isPasswordProtected: true,
          viewCount: share.viewCount,
          downloadCount: share.downloadCount
        });
      }

      // Non-protected: return metadata + content/downloadUrl
      const responseBody = {
        shareId,
        type: share.type,
        title: share.title,
        expiresAt: share.expiresAt,
        burnOnView: share.burnOnView,
        isPasswordProtected: false,
        viewCount: share.viewCount,
        downloadCount: share.downloadCount
      };

      if (share.type === "file") {
        responseBody.fileName = share.fileName;
        responseBody.fileSize = share.fileSize;
        responseBody.mimeType = share.mimeType;
      } else {
        responseBody.content = share.content;
      }

      // Handle burn-on-view delete
      if (share.burnOnView) {
        await deleteShare(shareId);
        // Note: For files, the stream will trigger cleanup Lambda to remove from S3 automatically
      }

      return respond(200, responseBody);
    }

    // ROUTE: POST /shares/{id}/verify
    const verifyMatch = path.match(/^\/shares\/([a-zA-Z0-9]{8})\/verify$/);
    if (method === "POST" && verifyMatch) {
      const shareId = verifyMatch[1];
      const body = JSON.parse(event.body || "{}");
      const { password } = body;

      const share = await getShare(shareId);
      if (!share) {
        return respond(404, { error: "Share not found or expired." });
      }

      const isValid = await verifyPassword(password, share.passwordHash);
      if (!isValid) {
        return respond(401, { error: "Incorrect password." });
      }

      const responseBody = {
        authorized: true,
        type: share.type
      };

      if (share.type === "file") {
        responseBody.fileName = share.fileName;
        responseBody.fileSize = share.fileSize;
        responseBody.mimeType = share.mimeType;
        responseBody.downloadUrl = await getDownloadPresignedUrl(share.s3Key, share.fileName);
      } else {
        responseBody.content = share.content;
      }

      // Handle burn-on-view delete
      if (share.burnOnView) {
        await deleteShare(shareId);
      }

      return respond(200, responseBody);
    }

    // ROUTE: POST /shares/{id}/download
    const downloadMatch = path.match(/^\/shares\/([a-zA-Z0-9]{8})\/download$/);
    if (method === "POST" && downloadMatch) {
      const shareId = downloadMatch[1];
      const share = await getShare(shareId);

      if (!share) {
        return respond(404, { error: "Share not found or expired." });
      }

      if (share.type !== "file") {
        return respond(400, { error: "Not a file share." });
      }

      if (share.passwordHash) {
        return respond(403, { error: "Password-protected. Verify via /verify endpoint instead." });
      }

      // Increment download counter
      await incrementDownloads(shareId);

      const downloadUrl = await getDownloadPresignedUrl(share.s3Key, share.fileName);

      return respond(200, { downloadUrl });
    }

    // Route not found
    return respond(404, { error: `Route not found: ${method} ${path}` });

  } catch (error) {
    console.error("API Request processing failed:", error);
    return respond(500, { error: "Internal Server Error" });
  }
}
