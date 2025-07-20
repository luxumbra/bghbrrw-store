import { createHash } from 'crypto'

type ContentKeyItem = string | number

const getContentKey = (item: ContentKeyItem) =>
  createHash('md5').update(JSON.stringify(item)).digest('hex')


export { getContentKey, type ContentKeyItem }