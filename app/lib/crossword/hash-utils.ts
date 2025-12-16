/**
 * Crossword Hash Utilities - Client Side
 * Used for local word verification using hashes from server
 */

/**
 * Get daily salt (must match server-side)
 */
function getDailySalt(): string {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(now.getTime() + istOffset)
  const dateStr = istTime.toISOString().split('T')[0]
  return `crossword-secure-salt-${dateStr}-knowhimanshu-v2`
}

/**
 * Hash a word using SHA-256 (browser crypto API)
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash a single word with position information
 * Must produce same hash as server for matching
 */
export async function hashWord(
  word: string, 
  number: number, 
  direction: 'across' | 'down'
): Promise<string> {
  const salt = getDailySalt()
  const message = `${salt}:${word.toUpperCase()}:${number}:${direction}`
  return sha256(message)
}

/**
 * Verify a user's answer against the server-provided hash
 */
export async function verifyAnswer(
  userWord: string,
  number: number,
  direction: 'across' | 'down',
  expectedHash: string
): Promise<boolean> {
  const userHash = await hashWord(userWord.toUpperCase(), number, direction)
  return userHash === expectedHash
}

/**
 * Verify all answers at once
 */
export async function verifyAllAnswers(
  userAnswers: { word: string; number: number; direction: 'across' | 'down' }[],
  wordHashes: { number: number; direction: 'across' | 'down'; hash: string }[]
): Promise<{ 
  results: { number: number; direction: 'across' | 'down'; correct: boolean }[]
  allCorrect: boolean 
}> {
  const results = await Promise.all(
    userAnswers.map(async (answer) => {
      const hashEntry = wordHashes.find(
        h => h.number === answer.number && h.direction === answer.direction
      )
      
      if (!hashEntry) {
        return { number: answer.number, direction: answer.direction, correct: false }
      }
      
      const correct = await verifyAnswer(
        answer.word, 
        answer.number, 
        answer.direction, 
        hashEntry.hash
      )
      return { number: answer.number, direction: answer.direction, correct }
    })
  )
  
  const allCorrect = results.every(r => r.correct)
  
  return { results, allCorrect }
}
