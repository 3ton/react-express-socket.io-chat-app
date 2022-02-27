import { unlink } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const fileDir = join(__dirname, '../files')

export const getFilePath = (filePath) => join(fileDir, filePath)

export const removeFile = async (filePath) =>
  await unlink(join(fileDir, filePath))
