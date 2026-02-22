import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { BoardMember } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BoardMemberDialog } from '@/features/foundation/components/board-member-dialog'
import { BoardMembersDeleteDialog } from '@/features/foundation/components/board-members-delete-dialog'
import { BoardMembersTable } from '@/features/foundation/components/board-members-table'
import type { BoardMemberFormData } from '@/features/foundation/data/schema'

// Mock data for development
const mockBoardMembers: BoardMember[] = [
  {
    id: '1',
    name: 'Ahmad Hidayat',
    position: 'Ketua Yayasan',
    photoUrl: '',
    bio: 'Pendidik dan pendiri Yayasan Assurur dengan pengalaman lebih dari 20 tahun di bidang pendidikan.',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Siti Aminah',
    position: 'Sekretaris',
    photoUrl: '',
    bio: 'Alumni pendidikan manajemen yang berdedikasi dalam pengembangan kurikulum sekolah.',
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Muhammad Rizky',
    position: 'Bendahara',
    photoUrl: '',
    bio: 'Praktisi keuangan dan perbankan yang membantu mengelola keuangan yayasan.',
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },
]

export function BoardMembersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // For now using mock data - will be replaced with real API
  const [data, setData] = useState<BoardMember[]>(mockBoardMembers)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = () => {
    setDialogMode('create')
    setSelectedMember(null)
    setDialogOpen(true)
  }

  const handleEdit = (member: BoardMember) => {
    setDialogMode('edit')
    setSelectedMember(member)
    setDialogOpen(true)
  }

  const handleDelete = (member: BoardMember) => {
    setSelectedMember(member)
    setDeleteDialogOpen(true)
  }

  const handleDialogSubmit = async (formData: BoardMemberFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (dialogMode === 'create') {
        const newMember: BoardMember = {
          id: Math.random().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        }
        setData([...data, newMember])
      } else {
        setData(
          data.map((m) =>
            m.id === selectedMember?.id ? { ...m, ...formData } : m
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setData(data.filter((m) => m.id !== selectedMember?.id))
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
          title='Dewan Pengurus'
          description='Kelola data dewan pengurus Yayasan Assurur'
          actions={
            <Button onClick={handleCreate}>
              <Plus className='h-4 w-4' />
              Tambah Anggota
            </Button>
          }
        />

        <BoardMembersTable
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <BoardMemberDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          boardMember={selectedMember ?? undefined}
          onSubmit={handleDialogSubmit}
          isLoading={isLoading}
        />

        <BoardMembersDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isLoading}
          boardMemberName={selectedMember?.name}
        />
      </Main>
    </>
  )
}
