import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

declare global {
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const connectionString = process.env.DATABASE_URL!
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.prisma) {
    const connectionString = process.env.DATABASE_URL!
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export { prisma }
