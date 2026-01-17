require('dotenv').config();

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined');
}

// Глобальный кэш (нужен для Vercel / serverless)
let cached = global.mongoose;

// console.log('cached1: ', cached);


if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

// console.log('cached2: ', cached);

// Если уже подключены — просто возвращаем соединение

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

//   console.log('cached3: ', cached);

  // Если подключения ещё нет — создаём его ОДИН раз
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
//   console.log('cached4: ', cached);
  console.log('MongoDB connected');
  return cached.conn;
}

module.exports = connectDB;
