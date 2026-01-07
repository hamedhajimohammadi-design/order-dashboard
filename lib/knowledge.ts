import { prisma } from '@/lib/prisma';

export async function searchKnowledgeBase(query: string) {
  // In a real app, you'd use vector search (pgvector) or full-text search.
  // For now, we'll do a simple contains search on the question.
  
  const results = await prisma.knowledgeBase.findMany({
    where: {
      question: {
        contains: query,
        mode: 'insensitive'
      }
    },
    take: 3
  });

  return results;
}

export async function getKnowledgeAnswer(key: string) {
  // If you have specific keys for common questions
  const entry = await prisma.knowledgeBase.findFirst({
    where: {
      question: {
        contains: key,
        mode: 'insensitive'
      }
    }
  });
  return entry?.answer || null;
}
