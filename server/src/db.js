import mongoose from "mongoose";
let connected = false;
// Connects to MongoDB / Azure DocumentDB (MongoDB-compatible). DocumentDB does not support retryable writes.
export async function connectDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri || process.env.MONGODB_ENABLED !== "true")
        return false;
    if (!connected) {
        await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME ?? "universe_resume", retryWrites: false });
        connected = true;
        console.log("Azure DocumentDB connected!");
    }
    return connected;
}
export async function disconnectDatabase() { if (connected) {
    await mongoose.disconnect();
    connected = false;
} }
