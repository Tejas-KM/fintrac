import { MongoClient, ObjectId } from "mongodb"
import { cache } from "react"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

// Check if we're in a Node.js environment
if (typeof window === "undefined") {
  // In development mode, use a global variable to preserve the connection
  // across hot-reloads
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, create a new client
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

// Use React's cache to prevent multiple connections during a single render
export const getDb = cache(async () => {
  // Skip database connection during build time
  if (process.env.VERCEL_ENV === "production" && process.env.NEXT_PHASE === "build") {
    console.log("Skipping DB connection during build")
    // Return a mock db during build
    return {
      collection: () => ({
        find: () => ({
          sort: () => ({
            limit: () => ({
              toArray: () => Promise.resolve([]),
            }),
            toArray: () => Promise.resolve([]),
          }),
          findOne: () => Promise.resolve(null),
          countDocuments: () => Promise.resolve(0),
        }),
        insertOne: () => Promise.resolve({ insertedId: "mock-id" }),
        updateOne: () => Promise.resolve({ modifiedCount: 1 }),
        deleteOne: () => Promise.resolve({ deletedCount: 1 }),
      }),
    }
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("finance-tracker")
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Failed to connect to database")
  }
})

export const formatId = (id: string) => new ObjectId(id)

