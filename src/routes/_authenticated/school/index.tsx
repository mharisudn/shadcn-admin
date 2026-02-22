import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/school/')({
  beforeLoad: async () => {
    throw redirect({
      to: '/school/units',
    })
  },
})
