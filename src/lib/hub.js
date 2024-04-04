import {
  FarcasterNetwork,
  getInsecureHubRpcClient,
  makeCastAdd,
  makeCastRemove,
  makeLinkAdd,
  makeLinkRemove,
  makeReactionAdd,
  makeUserDataAdd,
  Message,
  NobleEd25519Signer,
  ReactionType,
  UserDataType,
} from "@farcaster/hub-nodejs";
import 'dotenv/config'
import axios from 'axios';
import { hexToBytes } from "@noble/hashes/utils";


// const hubAPI = process.env.HUB_ENDPOINT
const hubAPI = 'https://nemes.farcaster.xyz:2281'
// Want to use async/await? Add the `async` keyword to your outer function/method.
export async function getCastsByMention(fid) {
  try {
    const response = await axios.get(hubAPI + '/v1/castsByMention?fid=' + parseInt(fid, 10));
    if (response.status = 200) {
      return response.data
    } else {
      console.error('faild to get cast by mention', fid, response)
      return {}
    }
  } catch (error) {
    console.error(error)
    throw new Error('Failed to get Casts By Mention')
  }
}

export async function submitMessage() {

}

// https://github.com/farcasterxyz/hub-monorepo/blob/main/packages/hub-nodejs/examples/write-data/index.ts
export async function makeCastAddWithMention(text, mentions, mentionsPositions) {

  const castWithMentions = await makeCastAdd(
    {
      text: " and  are big fans of ",
      embeds: [],
      embedsDeprecated: [],
      mentions: [3, 2, 1],
      mentionsPositions: [0, 5, 22],
    },
    dataOptions,
    ed25519Signer,
  );
  console.log(castWithMentions)
  return castWithMentions
}
