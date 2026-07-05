import { unmarshall } from "@aws-sdk/util-dynamodb";
import { deleteFile } from "../services/s3.js";

export async function handler(event) {
  console.log("Received Stream Event:", JSON.stringify(event));

  for (const record of event.Records) {
    // Only process REMOVE events (either manual deletion or TTL expiration)
    if (record.eventName === "REMOVE") {
      try {
        // Convert DynamoDB JSON format to standard JavaScript Object
        const oldImage = unmarshall(record.dynamodb.OldImage);
        
        console.log(`Processing REMOVE event for ShareId: ${oldImage.ShareId}, Type: ${oldImage.type}`);

        // If it's a file type and has an S3 key, delete the file from the S3 bucket
        if (oldImage.type === "file" && oldImage.s3Key) {
          console.log(`Triggering S3 delete for key: ${oldImage.s3Key}`);
          await deleteFile(oldImage.s3Key);
        } else {
          console.log("No S3 asset deletion needed (share type is text/code).");
        }
      } catch (error) {
        console.error("Failed to process DynamoDB stream record cleanup:", error);
      }
    }
  }
  
  return { message: "Stream processing complete." };
}
