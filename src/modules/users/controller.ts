import { Router } from 'express'
import type { Database } from '@/database'
import buildRepository from './repository'
import * as schema from './schema'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'
import NotFound from '@/utils/errors/NotFound'

export default (db: Database) => {
  const usersRepo = buildRepository(db)
  const router = Router()

  router
    .route('/')
    .get(
      jsonRoute(async (_req, res) => {
        const users = await usersRepo.getUsers()
        if (!users || users.length === 0) throw new NotFound('No users found')
        res.status(200).json(users)
      })
    )
    .post(
      jsonRoute(async (req, res) => {
        const body = schema.parseInsertable(req.body)
        const user = await usersRepo.createUser(body)
        res.status(201).json(user)
      })
    )
    .patch(unsupportedRoute)
    .put(unsupportedRoute)
    .delete(unsupportedRoute)

  router
    .route('/:id(\\d+)')
    .get(
      jsonRoute(async (req, res) => {
        const id = schema.parseId(req.params.id)
        const user = await usersRepo.getUserById(id)
        if (!user) throw new NotFound('User not found')
        res.status(200).json(user)
      })
    )
    .patch(
      jsonRoute(async (req, res) => {
        const id = schema.parseId(req.params.id)
        const body = schema.parseUpdateable(req.body)
        const updated = await usersRepo.updateUser(id, body)
        if (!updated) throw new NotFound('User not found')
        res.status(200).json(updated)
      })
    )
    .delete(
      jsonRoute(async (req, res) => {
        const id = schema.parseId(req.params.id)
        const deleted = await usersRepo.deleteUser(id)
        if (!deleted) throw new NotFound('User not found')
        res.status(200).json(deleted)
      })
    )

  return router
}
