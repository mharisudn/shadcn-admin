import { createContext, useContext, useState, type ReactNode } from 'react'
import type { BoardMember } from '@/lib/api/types'

interface BoardMembersContextValue {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  dialogMode: 'create' | 'edit'
  setDialogMode: (mode: 'create' | 'edit') => void
  selectedMember: BoardMember | null
  setSelectedMember: (member: BoardMember | null) => void
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
}

const BoardMembersContext = createContext<BoardMembersContextValue | undefined>(
  undefined
)

interface BoardMembersProviderProps {
  children: ReactNode
}

export function BoardMembersProvider({ children }: BoardMembersProviderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <BoardMembersContext.Provider
      value={{
        dialogOpen,
        setDialogOpen,
        dialogMode,
        setDialogMode,
        selectedMember,
        setSelectedMember,
        deleteDialogOpen,
        setDeleteDialogOpen,
      }}
    >
      {children}
    </BoardMembersContext.Provider>
  )
}

export function useBoardMembersContext() {
  const context = useContext(BoardMembersContext)
  if (context === undefined) {
    throw new Error(
      'useBoardMembersContext must be used within a BoardMembersProvider'
    )
  }
  return context
}
