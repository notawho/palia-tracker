export const getFileMeta = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })

    return {
      length: parseInt(response.headers.get('content-length')!, 10),
      modifiedAt: response.headers.get('last-modified')!,
    }
  } catch (error) {
    return null
  }
}
