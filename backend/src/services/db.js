import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME;

export async function getShare(shareId) {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { ShareId: shareId }
      })
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
      new PutCommand({
        TableName: tableName,
        Item: share
      })
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
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0
        },
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
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0
        },
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
      new DeleteCommand({
        TableName: tableName,
        Key: { ShareId: shareId }
      })
    );
  } catch (error) {
    console.error("DynamoDB DeleteShare Error:", error);
    throw error;
  }
}
