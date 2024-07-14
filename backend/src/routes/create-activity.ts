import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-error'

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        title: z.string(),
        occurs_at: z.string(),
      }),
    },
  }, async (req) => {
    const { tripId } = req.params
    const { title, occurs_at } = req.body

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      }
    })

    if (!trip) {
      throw new ClientError('Trip not found')
    }

    if (dayjs(occurs_at).isBefore(trip.starts_at)) {
      throw new ClientError('Invalid activity date.')
    }

    if (dayjs(occurs_at).isAfter(trip.ends_at)) {
      throw new ClientError('Invalid activity date.')
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        occurs_at,
        trip_id: tripId
      }
    })

    return { activityId: activity.id }
  })
}