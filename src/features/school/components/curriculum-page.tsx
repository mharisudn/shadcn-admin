import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const curriculumData = [
  {
    level: 'SD',
    grades: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
    subjects: [
      'Matematika',
      'Bahasa Indonesia',
      'IPA',
      'IPS',
      'PAI',
      'PKN',
      'Seni Budaya',
      'PJOK',
      'Bahasa Inggris',
    ],
  },
  {
    level: 'SMP',
    grades: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
    subjects: [
      'Matematika',
      'Bahasa Indonesia',
      'IPA',
      'IPS',
      'PAI',
      'PKN',
      'Seni Budaya',
      'PJOK',
      'Bahasa Inggris',
      'Prakarya',
      'TIK',
    ],
  },
]

export function CurriculumPage() {
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
          title='Kurikulum'
          description='Kurikulum pendidikan yang digunakan di seluruh unit sekolah'
        />

        <div className='grid gap-6 md:grid-cols-2'>
          {curriculumData.map((item) => (
            <Card key={item.level}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Kurikulum {item.level}</CardTitle>
                  <Badge>{item.grades.length} Kelas</Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='mb-2 font-semibold'>Kelas</h4>
                  <div className='flex flex-wrap gap-2'>
                    {item.grades.map((grade) => (
                      <Badge key={grade} variant='outline'>
                        {grade}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold'>Mata Pelajaran</h4>
                  <div className='grid grid-cols-2 gap-2'>
                    {item.subjects.map((subject) => (
                      <Badge key={subject} variant='secondary'>
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </>
  )
}
