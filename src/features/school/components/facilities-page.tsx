import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const facilitiesData = [
  {
    category: 'Ruang Kelas',
    items: [
      'Kelas Regular',
      'Kelas Multimedia',
      'Laboratorium Komputer',
      'Perpustakaan Mini',
    ],
    icon: '🏫',
  },
  {
    category: 'Laboratorium',
    items: ['Lab IPA', 'Lab Bahasa', 'Lab Komputer', 'Lab TKJ'],
    icon: '🔬',
  },
  {
    category: 'Olahraga',
    items: [
      'Lapangan Basket',
      'Lapangan Futsal',
      'Area Bermain',
      'Gudang Olahraga',
    ],
    icon: '⚽',
  },
  {
    category: 'Ibadah',
    items: ['Musholla', 'Kantor Sekretariat', 'Aula Serbaguna'],
    icon: '🕌',
  },
  {
    category: 'Fasilitas Pendukung',
    items: ['Kantin Sehat', 'UKS', 'Pos Keamanan', 'Taman Bermain'],
    icon: '🏢',
  },
]

export function FacilitiesPage() {
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
          title='Fasilitas'
          description='Daftar fasilitas yang tersedia di seluruh unit sekolah'
        />

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {facilitiesData.map((facility, idx) => (
            <Card key={idx}>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center gap-3'>
                  <span className='text-3xl'>{facility.icon}</span>
                  <h3 className='text-lg font-semibold'>{facility.category}</h3>
                </div>
                <ul className='space-y-2'>
                  {facility.items.map((item) => (
                    <li key={item} className='flex items-center gap-2 text-sm'>
                      <span className='h-1.5 w-1.5 rounded-full bg-primary' />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </>
  )
}
