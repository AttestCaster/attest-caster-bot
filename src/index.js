import 'dotenv/config'
import * as hub from './lib/hub.js'
import {
  IndexService,
} from '@ethsign/sp-sdk';
import * as fs from 'fs'

const listToBePosted = []
const fileStoragePath = './.lastHandledId'

const getLastHandled = () => {
  try {
    const lastHandledId = fs.readFileSync(fileStoragePath, { encoding: 'ascii', 'flag': 'r+' })
    return lastHandledId
  } catch (e) {
    if (e.errno === -2) {
      // if file not exits
      return 0
    }
    console.error('failed to getLastHandled')
    console.error(e)
    return -1
  }
}

const saveLastHandled = (idToSave) => {
  try {
    fs.writeFileSync(fileStoragePath, idToSave, { encoding: 'ascii', 'flag': 'w+' })
    console.log('saveLastHandled', idToSave)
    return idToSave
  } catch (e) {
    console.error('failed to saveLastHandled on id:', idToSave)
    console.error(e)
    return -1
  }
}

/**
 * Listen to the SignScan with a specified Schema Id
 * and check if the attestation 
 */
const listenToSignSchema = async () => {
  const indexService = new IndexService("testnet");
  const schemaId = process.env.SCHEMA_ID_TO_MONITOR
  console.log('schema id to monitor:', schemaId)
  if (schemaId === undefined) {
    console.error('undefined or invalid SCHEMA_ID_TO_MONITOR')
    throw new Error('invalid SCHEMA_ID_TO_MONITOR')
  }

  const initPage = 1
  let endPage = 1
  const pageSize = 100
  let firstQuery = true
  const lastSavedId = getLastHandled()
  console.log('get last saved id: ', lastSavedId)
  for (let page = initPage; page <= endPage; page++) {
    const res = await indexService.queryAttestationList({
      schemaId,
      page,
    })
    // console.log(res)
    // Update endpage
    if (firstQuery && res.total) {
      endPage = parseInt(res.total, 10) / pageSize + 1;
      firstQuery = false
    }
    // handle each page
    
    for (const row of res.rows) {
      // 
      if (row.id === lastSavedId) {
        // Should be the end of the whole loop
        console.log('Last saved id finished', lastSavedId, row.id, 'list length:', listToBePosted.length)
        return listToBePosted
      }
      console.log('[listenToSignSchema] push row to the list: ', row.id, 'listToBePosted.length', listToBePosted.length)
      listToBePosted.push(row)
    }
  }
  console.log('[listenToSignSchema] finished the loop, should be the first run. List Length: ', listToBePosted.length)
  return listToBePosted;
}

const postCast = async (row) => {
  const botFID = parseInt(process.env.botFID, 10)
  const castData = JSON.parse(row.data)
  const fidToMention = castData.castAuthorFID
  const frameURL = 'https://test-frames-eosin.vercel.app/api/frame/' + row.id
  const text = 'New attestation issued to the cast of  via AttestCaster. ' + frameURL
  const mentions = [fidToMention]
  // const fid = process.env.BOT_FID
  const mentionsPositions = [0]

  const castAddData = await hub.makeCastAddWithMention(text, mentions, mentionsPositions)
  const response = await hub.submitMessage(castAddData)
  console.log('response', response)
}
// Todo:: add lock and use better storage solution

const main = async () => {
  console.log('----------------------------------------------------')
  console.log('start to run a new batch of operations')
  const list = await listenToSignSchema()
  const listToBePosted = list.reverse()
  console.log('--- get the list to be posted --- length: ', listToBePosted.length)
  for (const row of listToBePosted) {
    try {
      console.log('-- start to post on id:', row.id)
      const postInfo = await postCast(row)
      if (!postInfo) {
        console.log('-- failed to post - stop to operate this batch of operations', postInfo)
        break;
      }
      console.log('postInfo', postInfo)
      saveLastHandled(row.id)
    } catch(e) {
      console.error('-- post on ', row.id, ' got an error:')
      console.error(e)
      console.log('-- stop to operate this batch of operations')
      break;
    }
  }
  console.log('end of this round operations')
  console.log('----------------------------------------------------')
}


main()
