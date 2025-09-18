// Very small in-memory fallback store for development when MongoDB is unavailable.
const users = new Map();
let idCounter = 1;

export const createUser = async ({ name, email, password }) => {
  const id = (idCounter++).toString();
  const user = { _id: id, id, name, email, password, assistantName: '', assistantImage: '', description: '' };
  users.set(id, user);
  return user;
};

export const findUserByEmail = async (email) => {
  for (const user of users.values()) {
    if (user.email === email) return user;
  }
  return null;
};

export const findUserById = async (id) => {
  return users.get(id) || null;
};

export const updateUser = async (id, data) => {
  const user = users.get(id);
  if (!user) return null;
  const updated = { ...user, ...data };
  users.set(id, updated);
  return updated;
};

export default { createUser, findUserByEmail, findUserById, updateUser };
