import { Hono } from 'hono'
import { postsRouter } from './posts'
import { pagesRouter } from './pages'
import { categoriesRouter } from './categories'
import { statsRouter } from './stats'
import { mediaRouter } from './media'
import type { HonoEnv } from '../env.d'

const cms = new Hono<HonoEnv>()

// Aggregate all CMS routes
cms.route('/posts', postsRouter)
cms.route('/pages', pagesRouter)
cms.route('/categories', categoriesRouter)
cms.route('/stats', statsRouter)
cms.route('/media', mediaRouter)

export { cms as cmsRouter }
