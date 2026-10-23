import { prisma } from './client'

async function main() {
  try {
    await prisma.$connect()
    console.log('Prisma connection successful')
    await prisma.$disconnect()
  } catch (error) {
    console.error('Prisma connection failed:', error)
    process.exit(1)
  }
}

main()