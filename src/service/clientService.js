import axios from 'axios';
import * as clientModel from '../model/clientModel.js';
import * as userModel from '../model/userModel.js';

// Stub removed social media services
const instaPostService = { findByClientId: async () => [] };
const instaLikeService = { findByShortcode: async () => null };
const tiktokPostService = { findByClientId: async () => [] };
const tiktokCommentService = { findByVideoId: async () => null };


const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';

export const findAllClients = async () => await clientModel.findAll();

export const findAllActiveClients = async () => await clientModel.findAllActive();

export const findAllActiveDirektoratClients = async () =>
  await clientModel.findAllActiveDirektorat();

export const findAllClientsByType = async (clientType) =>
  await clientModel.findAllByType(clientType);

export const findClientById = async (client_id) => await clientModel.findById(client_id);

export const findClientsByGroup = async (group) => await clientModel.findByGroup(group);

export const createClient = async (data) => await clientModel.create(data);

export const updateClient = async (client_id, data) => await clientModel.update(client_id, data);

export const deleteClient = async (client_id) => await clientModel.remove(client_id);


export async function fetchTiktokSecUid(username) {
  if (!username) return null;
  try {
    const res = await axios.get(`https://${RAPIDAPI_HOST}/api/user/info`, {
      params: { uniqueId: username.replace(/^@/, "") },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });
    return res.data?.userInfo?.user?.secUid || null;
  } catch {
    return null;
  }
}

export async function getClientSummary(client_id) {
  const client = await clientModel.findById(client_id);
  if (!client) return null;

  const users = await userModel.findUsersByClientId(client_id);

  // NOTE: Social media data features removed
  return {
    client,
    user_count: users.length,
    insta_post_count: 0,
    tiktok_post_count: 0,
    total_insta_likes: 0,
    total_tiktok_comments: 0,
  };
}
