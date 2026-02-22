import { Link } from '@tanstack/react-router'
import { FileText, Image, FolderOpen, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const statsData = {
  totalPosts: 45,
  publishedPosts: 32,
  draftPosts: 13,
  totalMedia: 128,
  totalCategories: 8,
}

export function CmsIndexPage() {
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
          title='Content Management'
          description='Kelola konten website, media, dan kategori'
        />

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Artikel</p>
                  <p className='text-2xl font-bold'>{statsData.totalPosts}</p>
                </div>
                <FileText className='h-8 w-8 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Published</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {statsData.publishedPosts}
                  </p>
                </div>
                <BarChart3 className='h-8 w-8 text-green-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Draft</p>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {statsData.draftPosts}
                  </p>
                </div>
                <FileText className='h-8 w-8 text-yellow-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Media</p>
                  <p className='text-2xl font-bold'>{statsData.totalMedia}</p>
                </div>
                <Image className='h-8 w-8 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Link to='/cms/posts' className='block'>
            <Card className='transition-colors hover:bg-muted/50'>
              <CardContent className='flex items-center gap-4 p-6'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <FileText className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Artikel</h3>
                  <p className='text-sm text-muted-foreground'>
                    Kelola artikel dan berita
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to='/cms/media' className='block'>
            <Card className='transition-colors hover:bg-muted/50'>
              <CardContent className='flex items-center gap-4 p-6'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10'>
                  <Image className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Media Library</h3>
                  <p className='text-sm text-muted-foreground'>
                    Kelola gambar dan dokumen
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to='/cms/categories' className='block'>
            <Card className='transition-colors hover:bg-muted/50'>
              <CardContent className='flex items-center gap-4 p-6'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10'>
                  <FolderOpen className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Kategori</h3>
                  <p className='text-sm text-muted-foreground'>
                    Kelola kategori konten
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </Main>
    </>
  )
}
