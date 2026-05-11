import { client } from '../lib/client'

export interface ContractFile {
  label: string
  url: string
}

export interface ContractSettings {
  files: ContractFile[]
  introText?: string
}

export async function getContractFiles(): Promise<ContractSettings> {
  try {
    const data = await client.fetch<ContractSettings | null>(
      `*[_type == "contractFiles" && _id == "contractFiles"][0]{
        "files": files[]{
          label,
          "url": file.asset->url
        },
        introText
      }`,
      {},
      { cache: 'no-store' }
    )
    return data ?? { files: [] }
  } catch (err) {
    console.error('[contractFiles] Sanity fetch failed:', err)
    return { files: [] }
  }
}
