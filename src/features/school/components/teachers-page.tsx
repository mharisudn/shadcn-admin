import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Teacher } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TeacherDialog } from '@/features/school/components/teacher-dialog'
import { TeachersDeleteDialog } from '@/features/school/components/teachers-delete-dialog'
import { TeachersTable } from '@/features/school/components/teachers-table'
import type { TeacherFormData } from '@/features/school/data/schema'

// Mock data
const mockTeachers: Teacher[] = [
  {
    id: '1',
    schoolUnitId: '1',
    name: 'H. Ahmad Suhendi, M.Pd',
    subject: 'Matematika',
    photoUrl: '',
    bio: 'Guru matematika dengan pengalaman 15 tahun di bidang pendidikan.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    schoolUnitId: '1',
    name: 'Hj. Siti Aminah, S.Pd',
    subject: 'Bahasa Indonesia',
    photoUrl: '',
    bio: 'Guru bahasa Indonesia yang bersertifikasi.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    schoolUnitId: '2',
    name: 'Drs. Budi Santoso, M.M',
    subject: 'Agama Islam',
    photoUrl: '',
    bio: 'Mengajar agama Islam dengan pendekatan yang modern.',
    createdAt: new Date().toISOString(),
  },
]

const mockSchoolUnits = [
  { id: '1', name: 'SDQu Assurur 01 Pusat' },
  { id: '2', name: 'SDQu Assurur 02' },
  { id: '3', name: 'SMP Assurur Islamic School' },
]

export function TeachersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [data, setData] = useState<Teacher[]>(mockTeachers)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = () => {
    setDialogMode('create')
    setSelectedTeacher(null)
    setDialogOpen(true)
  }

  const handleEdit = (teacher: Teacher) => {
    setDialogMode('edit')
    setSelectedTeacher(teacher)
    setDialogOpen(true)
  }

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDeleteDialogOpen(true)
  }

  const handleDialogSubmit = async (formData: TeacherFormData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (dialogMode === 'create') {
        const newTeacher: Teacher = {
          id: Math.random().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        }
        setData([...data, newTeacher])
      } else {
        setData(
          data.map((t) =>
            t.id === selectedTeacher?.id ? { ...t, ...formData } : t
          )
        )
      }

      setDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setData(data.filter((t) => t.id !== selectedTeacher?.id))
      setDeleteDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <PageHeader
          title='Guru'
          description='Kelola data guru di seluruh unit sekolah Yayasan Assurur'
          actions={
            <Button onClick={handleCreate}>
              <Plus className='h-4 w-4' />
              Tambah Guru
            </Button>
          }
        />

        <TeachersTable data={data} onEdit={handleEdit} onDelete={handleDelete} />

        <TeacherDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          teacher={selectedTeacher ?? undefined}
          schoolUnits={mockSchoolUnits}
          onSubmit={handleDialogSubmit}
          isLoading={isLoading}
        />

        <TeachersDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isLoading}
          teacherName={selectedTeacher?.name}
        />
      </Main>
    </>
  )
}
