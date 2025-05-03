require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://madhusanka:UrTQAitLgHvVDG0y@cluster0.0a4mi.mongodb.net/');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  geohash: String,
});
const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  const user = await User.create(req.body);
  res.send({ _id: user._id, email: user.email });
});

app.post('/login', async (req, res) => {
  const user = await User.findOne(req.body);
  if (user) res.send({ _id: user._id, email: user.email });
  else res.status(404).send('Not found');
});

app.post('/update-location', async (req, res) => {
  const { userId, geohash } = req.body;
  await User.updateOne({ _id: userId }, { geohash });
  console.log("location updated:", userId, geohash);
  res.send({ ok: true });
});

app.post('/discover', async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).send('User not found');
  const nearby = await User.find({ geohash: user.geohash, _id: { $ne: userId } });
  res.send(nearby);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
