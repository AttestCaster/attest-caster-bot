import 'dotenv/config'
import * as hub from './lib/hub.js'

const main = async () => {

  // Get notifications from Farcaster Hub
  const fid = 411389
  // const fid = process.env.BOT_FID
  const mentions = await hub.getCastsByMention(fid)
  console.log('mentions', mentions.messages[0].data)
  
  const castData = await hub.makeCastAddWithMention('text', [1], [1])

  // Handle each new mentioned cast

  // Update / store records

}


main()
