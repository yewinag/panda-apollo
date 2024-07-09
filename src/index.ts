import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use MongoDB connection string from environment variables
const mongoDBUri = process.env.MONGODB_URI;

if (!mongoDBUri) {
  console.error('MongoDB connection string is missing in .env file');
  process.exit(1);
}

mongoose
  .connect(mongoDBUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const typeDefs = `#graphql

  type Movie {
    name: String
    mm_name: String
    rating: Float
    released_date: String
    show_type: String
    cover_path: String
    backdrop_path: String
  }

  type Query {
    films: [Movie]
  }
`;

const movieSchema = new mongoose.Schema({
  name: String,
  mm_name: String,
  rating: Number,
  released_date: String,
  show_type: String,
  cover_path: String,
  backdrop_path: String,
});
const MovieModel = mongoose.model('Movies', movieSchema);

const resolvers = {
  Query: {
    films: async () => await MovieModel.find({}),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);
