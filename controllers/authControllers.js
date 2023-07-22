const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const { HttpError, controllersWrapper, sendEmail } = require("../helpers");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const payload = {
    email,
  };

  const verificationToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: 420,
  });
  const randomKey = Math.floor(Math.random() * (9999 - 1000)) + 1000;
  const verificationKey = randomKey.toString();
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
    verificationKey,
  });

  await sendEmail(email, verificationKey);

  res.status(201).json({
    message: "Verify email send success",
    verifyToken: newUser.verificationToken,
  });
};

const verification = async (req, res) => {
  const { verificationToken, verificationKey } = req.body;
  let user;
  try {
    const { email } = jwt.verify(verificationToken, SECRET_KEY);
    user = await User.findOne({ email });
    if (
      !user ||
      !user.verificationToken ||
      user.verificationToken !== verificationToken
    ) {
      throw HttpError(400, "User not found or time is out, please try again");
    }
  } catch (error) {
    throw HttpError(400, "User not found or time is out, please try again");
  }

  if (user.verificationKey === verificationKey) {
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.json({ message: "Verification successful" });
    return;
  }

  if (user.verificationCount !== 3) {
    await User.findByIdAndUpdate(user._id, {
      verificationCount: user.verificationCount + 1,
    });
    throw HttpError(400, "Wrong code, try again");
  }

  throw HttpError(400, "Verification failled try again");
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const payload = {
    email,
  };

  const verificationToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: 420,
  });
  const randomKey = Math.floor(Math.random() * (9999 - 1000)) + 1000;
  const verificationKey = randomKey.toString();

  await User.findByIdAndUpdate(user._id, {
    verificationToken,
    verificationKey,
  });

  await sendEmail(email, verificationKey);

  res.json({ message: "Verify email send success", verificationToken });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Password is wrong");
  }

  if (!user.verify) {
    const payload = {
      email,
    };

    const verificationToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: 420,
    });
    const randomKey = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    const verificationKey = randomKey.toString();

    await User.findByIdAndUpdate(user._id, {
      verificationToken,
      verificationKey,
    });

    await sendEmail(email, verificationKey);

    throw HttpError(
      401,
      "Please, verify your email. Verification email send sucsess"
    );
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email } = req.user;

  res.json({
    email,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const fileName = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, fileName);

  Jimp.read(tempUpload, async (err, ava) => {
    if (err) throw err;
    await ava.resize(256, 256).writeAsync(tempUpload);
    await fs.rename(tempUpload, resultUpload);
  });

  const avatarURL = path.join("avatars", fileName);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: controllersWrapper(register),
  login: controllersWrapper(login),
  getCurrent: controllersWrapper(getCurrent),
  logout: controllersWrapper(logout),
  updateAvatar: controllersWrapper(updateAvatar),
  verification: controllersWrapper(verification),
  resendVerification: controllersWrapper(resendVerification),
};
