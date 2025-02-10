const db = require('../database/user_database');
const {isEmail, isUUID} = require('../helper_functions');
const {hash, generateAccessToken, decodeToken, verifyToken} = require('../conversion_functions');

exports.login = async (req, res) => {
  const email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  const salt = await db.getSalt(email);

  if (!salt.salt) {
    res.status(401).json({message: 'Invalid email or password.'}).end();
    return;
  }

  password = hash(req.body.password, salt.salt)[0];

  const user = await db.getUser(email, password);
  const token = generateAccessToken(user);

  if (!user) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (!user.id) {
    res.status(401).json({message: 'Invalid email or password.'}).end();
  } else if (user.status === 'disabled') {
    res.status(403).json({message: 'User is not active.'}).end();
  } else if (user.status === 'pending') {
    res.status(403).json(user).end();
  } else {
    res
    .status(200)
    .json({user: user, token: token})
    .end();
  }
};

exports.create = async (req, res) => {
  const userObj = req.body;

  if (!isEmail(userObj.email) || !userObj.password || !userObj.nickname) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  const salt = await db.getSalt(userObj.email);

  if (salt.salt) {
    res.status(409).json({message: 'User already exists.'}).end();
    return;
  }

  const hashed = hash(userObj.password);
  userObj.password = hashed[0];
  userObj.salt = hashed[1];

  const user = await db.createUser(userObj);
  const token = generateAccessToken(user);

  if (!user) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (!user.id) {
    res.status(400).json({message: 'Invalid data.'}).end();
  } else {
    res.status(201).json({user: user, token: token}).end();
  }
};

exports.register = async (req, res) => {
  const user = await db.registerUser(req.params.id);

  if (!user) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (!user.id) {
    res.status(400).json({message: 'Invalid data.'}).end();
  } else {
    res.status(200).json({message: 'Verified.'}).end();
  }
};

exports.findOne = async (req, res) => {
  const token = verifyToken(req);

  const id = req.params.id;

  if (!isUUID(id)) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  const user = await db.getUserById(id);

  if (!user) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (!user.id) {
    res.status(404).json({message: 'User not found.'}).end();
  } else {
    res.status(200).json({user: user, token: token}).end();
  }
}

exports.getLists = async (req, res) => {
  const token = verifyToken(req);
  const user = decodeToken(token);

  const id = req.params.id;

  if (!isUUID(id)) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  let lists = await db.getLists(id);

  if (!lists) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (!lists.length) {
    res.status(404).json({message: 'No lists found.'}).end();
  } else {
    if (!user || user.id !== id) lists = lists.filter(list => !list.is_private);

    res.status(200).json({lists: lists, token: token}).end();
  }
}

exports.changePassword = async (req, res) => {
  const token = verifyToken(req);
  const user = decodeToken(token);

  if (!user) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  let password = req.body.password;
  let new_password = req.body.new_password;

  if (!isUUID(req.params.id) || !new_password) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  const salt = await db.getSalt(user.email);

  if (!salt.salt) {
    res.status(404).json({message: 'Unknown user.'}).end();
    return;
  }

  password = hash(password, salt.salt)[0];
  new_password = hash(new_password, salt.salt)[0];

  const result = await db.changePassword(req.params.id, password, new_password);

  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 'not found') {
    res.status(404).json({message: 'Unknown user.'}).end();
  } else if (result === 'not active') {
    res.status(400).json({message: 'User not active.'}).end();
  } else if (result === 'wrong password') {
    res.status(403).json({message: 'Incorrect password.'}).end();
  } else {
    res.status(200).json({token: null}).end();
  }
};

exports.update = async (req, res) => {
  const token = verifyToken(req);
  const updater = decodeToken(token);

  if (!updater) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const user = req.body;

  if (!isUUID(req.params.id)) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  let result;

  if (updater.id === req.params.id) {
    if (!isEmail(user.email) || !user.nickname) {
      res.status(400).json({message: 'Invalid data.'}).end();
      return;
    }

    result = await db.updateUser(req.params.id, user);
  } else if (updater.type === 'admin') {
    if (!user.status || !user.type) {
      res.status(400).json({message: 'Invalid data.'}).end();
      return;
    }

    result = await db.setUserStatusType(req.params.id, user);
  } else {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 0) {
    res.status(400).json({message: 'Invalid data.'}).end();
  } else {
    res.status(200).json({token: token}).end();
  }
};
