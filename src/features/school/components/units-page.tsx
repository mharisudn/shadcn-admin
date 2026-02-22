import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { SchoolUnit } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SchoolUnitDialog } from '@/features/school/components/school-unit-dialog'
import { SchoolUnitsDeleteDialog } from '@/features/school/components/school-units-delete-dialog'
import { SchoolUnitsTable } from '@/features/school/components/school-units-table'
import type { SchoolUnitFormData } from '@/features/school/data/schema'

// Mock data
const mockSchoolUnits: SchoolUnit[] = [
  {
    id: '1',
    name: 'SDQu Assurur 01 Pusat',
    level: 'sd',
    address: 'Jl. Pendidikan No. 123, Jakarta Selatan',
    phone: '021-1234567',
    principalName: 'H. Ahmad Suhendi, M.Pd',
    establishedDate: '2010-05-15',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'SDQu Assurur 02',
    level: 'sd',
    address: 'Jl. Merdeka No. 45, Jakarta Timur',
    phone: '021-7654321',
    principalName: 'Hj. Siti Aminah, S.Pd',
    establishedDate: '2015-07-20',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'SMP Assurur Islamic School',
    level: 'smp',
    address: 'Jl. Taruna No. 78, Jakarta Barat',
    phone: '021-9876543',
    principalName: 'Drs. Budi Santoso, M.M',
    establishedDate: '2012-01-10',
    createdAt: new Date().toISOString(),
  },
]

export function UnitsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedUnit, setSelectedUnit] = useState<SchoolUnit | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [data, setData] = useState<SchoolUnit[]>(mockSchoolUnits)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = () => {
    setDialogMode('create')
    setSelectedUnit(null)
    setDialogOpen(true)
  }

  const handleEdit = (unit: SchoolUnit) => {
    setDialogMode('edit')
    setSelectedUnit(unit)
    setDialogOpen(true)
  }

  const handleDelete = (unit: SchoolUnit) => {
    setSelectedUnit(unit)
    setDeleteDialogOpen(true)
  }

  const handleDialogSubmit = async (formData: SchoolUnitFormData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (dialogMode === 'create') {
        const newUnit: SchoolUnit = {
          id: Math.random().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        }
        setData([...data, newUnit])
      } else {
        setData(
          data.map((u) =>
            u.id === selectedUnit?.id ? { ...u, ...formData } : u
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
      setData(data.filter((u) => u.id !== selectedUnit?.id))
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
          title='Unit Sekolah'
          description='Kelola data unit sekolah di bawah naungan Yayasan Assurur'
          actions={
            <Button onClick={handleCreate}>
              <Plus className='h-4 w-4' />
              Tambah Unit
            </Button>
          }
        />

        <SchoolUnitsTable data={data} onEdit={handleEdit} onDelete={handleDelete} />

        <SchoolUnitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          schoolUnit={selectedUnit ?? undefined}
          onSubmit={handleDialogSubmit}
          isLoading={isLoading}
        />

        <SchoolUnitsDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isLoading}
          schoolUnitName={selectedUnit?.name}
        />
      </Main>
    </>
  )
}
