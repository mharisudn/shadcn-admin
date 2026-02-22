import { Loader2 } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function FoundationProfilePage() {
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
          title='Profil Yayasan'
          description='Kelola visi, misi, dan sejarah Yayasan Assurur'
        />
        <div className='flex items-center justify-center p-12'>
          <div className='text-center'>
            <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin' />
            <p className='text-muted-foreground'>Memuat profil yayasan...</p>
            <p className='mt-2 text-sm text-muted-foreground'>
              Pastikan API telah dikonfigurasi dengan benar
            </p>
          </div>
        </div>
      </Main>
    </>
  )
}
