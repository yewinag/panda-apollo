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
  type Ads {
    id: ID
    name: String
    image: String
    link: String
  }

  type Query {
    latest: [Movie]
    anime: [Movie]
    tv_shows: [Movie]
    movies: [Movie]
    ads: [Ads]
  }
`;

const adsSchema = new mongoose.Schema({
  name: String,
  image: String,
  link: String,
});

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
const AdsModel = mongoose.model('Ads', adsSchema);
const homepageLimit = 10;
const homepageAdsLimit = 5;
const resolvers = {
  Query: {
    latest: async () =>
      await MovieModel.find({})
        .sort({ released_date: -1 })
        .limit(homepageLimit),
    anime: async () => await MovieModel.find({}).limit(homepageLimit),
    tv_shows: async () =>
      await MovieModel.find({ show_type: 'tv_show' }).limit(homepageLimit),
    movies: async () => await MovieModel.find({}).limit(homepageLimit),
    ads: async () =>
      await AdsModel.find({}).sort({ createdAt: 1 }).limit(homepageAdsLimit),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);
