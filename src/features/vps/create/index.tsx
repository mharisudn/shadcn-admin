import { Cloud, Globe, Zap, Search as SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { Notifications } from '@/components/notifications'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'

const serverPlans = [
  {
    provider: 'Tencent',
    cpu: '2 vCPU',
    ram: '2 GB',
    storage: '40 GB',
    egress: '512 GB (20 Mbps)',
    price: '60.000',
  },
  {
    provider: 'Tencent',
    cpu: '2 vCPU',
    ram: '2 GB',
    storage: '50 GB',
    egress: '1.02 TB (30 Mbps)',
    price: '75.000',
  },
  {
    provider: 'Tencent',
    cpu: '2 vCPU',
    ram: '4 GB',
    storage: '60 GB',
    egress: '1.54 TB (30 Mbps)',
    price: '90.000',
  },
  {
    provider: 'Tencent',
    cpu: '2 vCPU',
    ram: '4 GB',
    storage: '70 GB',
    egress: '2.05 TB (30 Mbps)',
    price: '125.000',
  },
  {
    provider: 'Tencent',
    cpu: '2 vCPU',
    ram: '8 GB',
    storage: '80 GB',
    egress: '2.56 TB (30 Mbps)',
    price: '150.000',
  },
  {
    provider: 'Tencent',
    cpu: '2 vCPU',
    ram: '8 GB',
    storage: '100 GB',
    egress: '3.07 TB (30 Mbps)',
    price: '185.000',
  },
]

export function CreateVPS() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <Notifications />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='gap-4'>
        <PageHeader
          title='Create VPS'
          description='Configure your virtual private server'
          backButton={{ to: '/vps', label: '' }}
          className='mb-2'
        />

        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            {/* VPS Name */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-semibold'>
                  VPS Name
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder='Enter VPS name (minimum 3 characters)'
                  className='h-12'
                />
              </CardContent>
            </Card>

            {/* Select Region */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                  <Globe className='h-5 w-5' />
                  Select Region
                </CardTitle>
                <CardDescription>
                  Choose the region closest to your users for better
                  performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='relative flex cursor-pointer items-center justify-between rounded-lg border border-slate-500 bg-slate-700/5 p-4 transition-all'>
                    <div className='flex items-center gap-3'>
                      <span className='text-2xl'>🇸🇬</span>
                      <div className='flex flex-col'>
                        <span className='text-sm font-bold'>Singapore</span>
                        <span className='text-xs text-muted-foreground'>
                          Singapore
                        </span>
                      </div>
                    </div>
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-slate-700'>
                      <Zap className='h-3 w-3 text-white' />
                    </div>
                  </div>
                  <div className='flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all hover:border-slate-600'>
                    <span className='text-2xl'>🇮🇩</span>
                    <div className='flex flex-col'>
                      <span className='text-sm font-bold'>Jakarta</span>
                      <span className='text-xs text-muted-foreground'>
                        Indonesia
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select Operating System */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-slate-100'>
                    <div className='h-3 w-4 rounded-sm border-2 border-slate-600' />
                  </div>
                  Select Operating System
                </CardTitle>
                <CardDescription>
                  Choose the operating system for your VPS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='relative'>
                  <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Select defaultValue='ubuntu-24'>
                    <SelectTrigger className='h-12 pl-10'>
                      <SelectValue placeholder='Search OS' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ubuntu-24'>
                        Ubuntu Server 24.04 LTS 64bit
                      </SelectItem>
                      <SelectItem value='ubuntu-22'>
                        Ubuntu Server 22.04 LTS 64bit
                      </SelectItem>
                      <SelectItem value='debian-12'>Debian 12 64bit</SelectItem>
                      <SelectItem value='centos-9'>
                        CentOS Stream 9 64bit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Select Server Plan */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-slate-100'>
                    <div className='h-3 w-4 rounded-sm border-2 border-slate-600' />
                  </div>
                  Select Server Plan
                </CardTitle>
                <CardDescription>
                  Choose the plan that best fits your needs.
                </CardDescription>
              </CardHeader>
              <CardContent className='overflow-x-auto p-0'>
                <Table className='min-w-[36rem]'>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='pl-6'>Provider</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Ram</TableHead>
                      <TableHead>Storage</TableHead>
                      <TableHead>Egress</TableHead>
                      <TableHead className='pr-6 text-right'>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serverPlans.map((plan, index) => (
                      <TableRow
                        key={index}
                        className={index === 3 ? 'bg-slate-900/10' : ''}
                      >
                        <TableCell className='pl-6 font-medium'>
                          <div className='flex items-center gap-2'>
                            <Cloud className='h-4 w-4 text-muted-foreground' />
                            {plan.provider}
                          </div>
                        </TableCell>
                        <TableCell>{plan.cpu}</TableCell>
                        <TableCell>{plan.ram}</TableCell>
                        <TableCell>{plan.storage}</TableCell>
                        <TableCell className='text-xs text-muted-foreground'>
                          {plan.egress}
                        </TableCell>
                        <TableCell className='pr-6 text-right font-bold'>
                          Rp {plan.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-6'>
            <Card className='lg:sticky lg:top-24'>
              <CardHeader>
                <CardTitle className='text-lg'>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <p className='text-xs tracking-wider text-muted-foreground uppercase'>
                      VPS Name
                    </p>
                    <p className='font-bold'>Not specified</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs tracking-wider text-muted-foreground uppercase'>
                      Region
                    </p>
                    <div className='flex items-center gap-2'>
                      <span>🇸🇬</span>
                      <p className='font-bold'>Singapore</p>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs tracking-wider text-muted-foreground uppercase'>
                      Operating System
                    </p>
                    <div className='flex items-center gap-2 text-sm font-medium'>
                      <span className='text-xs'>🐧</span>
                      <p>Ubuntu Server 24.04 LTS 64bit</p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg border bg-slate-50 p-4 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    No plan selected
                  </p>
                </div>

                <div className='flex items-baseline justify-between'>
                  <span className='text-lg font-bold'>Total Cost</span>
                  <span className='text-lg font-bold text-foreground'>
                    Rp 0/month
                  </span>
                </div>
                <p className='-mt-4 text-right text-xs text-muted-foreground'>
                  Billed monthly • Cancel anytime
                </p>

                <Button size='lg' className='w-full'>
                  <Zap className='mr-2 h-4 w-4 fill-current' />
                  Create VPS
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
