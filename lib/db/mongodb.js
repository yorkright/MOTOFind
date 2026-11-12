import dns from "node:dns";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI

function configureMongoDns() {
    const mongodbDnsServers = process.env.MONGODB_DNS_SERVERS;

    if (mongodbDnsServers === undefined) {
        return;
    }

    const dnsServers = mongodbDnsServers.split(",").map((server) =>
        server.trim()
    );

    if (dnsServers.some((server) => !server)) {
        throw new Error(
            "MONGODB_DNS_SERVERS must contain comma-separated DNS server addresses."
        );
    }

    dns.setServers(dnsServers);
}

if (!MONGODB_URI) {
    throw new Error(
        "PLease provide the right URI in your env file."
    );

}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}


async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    configureMongoDns();

    if (!cached.promise) {
        console.log("[MongoDB] Connecting to MongoDB Atlas...");

        cached.promise = mongoose
            .connect(MONGODB_URI, { bufferCommands: false })
            .catch((error) => {
                cached.promise = null;
                throw error;
            });
    }

    cached.conn = await cached.promise;
    console.log("[MongoDB] Connected successfully.");

    return cached.conn;
}

export default connectDB;


