import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  ChevronLeft,
  RefreshCw,
  Key,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Monitor,
  Activity,
  Shield,
  Calendar,
  ArrowUpCircle,
  Settings2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Notifications } from '@/components/notifications'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'

export function VPSDetails() {
  const navigate = useNavigate()
  const { vpsId } = useParams({ from: '/_authenticated/vps/$vpsId' })
  const [showPassword, setShowPassword] = useState(false)

  // Mock data for the demonstration
  const vps = {
    id: vpsId,
    name: 'test-aapanel',
    status: 'active',
    created: '2026-02-09',
    ip: '43.157.204.137',
    username: 'root',
    password: '••••••••••••',
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <Notifications />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* VPS Detail Header */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate({ to: '/vps' })}
              className='-ml-1'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold tracking-tight sm:text-2xl'>
                  {vps.name}
                </h1>
                <Badge
                  variant='outline'
                  className='border-green-200 bg-green-50 px-2 py-0 font-medium text-green-700 capitalize'
                >
                  {vps.status}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground sm:text-sm'>
                vps • Created on {vps.created}
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outline' size='sm' className='h-8 lg:h-9'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Restart
            </Button>
            <Button variant='outline' size='sm' className='h-8 lg:h-9'>
              <Key className='mr-2 h-4 w-4' />
              Reset Password
            </Button>
            <Button variant='outline' size='sm' className='h-8 lg:h-9'>
              <ExternalLink className='mr-2 h-4 w-4' />
              Web Console
            </Button>
          </div>
        </div>

        <Card className='mt-2 border-none bg-transparent shadow-none'>
          <Tabs defaultValue='access' className='w-full'>
            <TabsList>
              <TabsTrigger value='access'>
                <Monitor className='mr-2 h-4 w-4' />
                Access
              </TabsTrigger>
              <TabsTrigger value='usage'>
                <Activity className='mr-2 h-4 w-4' />
                Usage
              </TabsTrigger>
              <TabsTrigger value='firewall'>
                <Shield className='mr-2 h-4 w-4' />
                Firewall
              </TabsTrigger>
              <TabsTrigger value='renew'>
                <Calendar className='mr-2 h-4 w-4' />
                Renew
              </TabsTrigger>
              <TabsTrigger value='upgrade'>
                <ArrowUpCircle className='mr-2 h-4 w-4' />
                Upgrade
              </TabsTrigger>
              <TabsTrigger value='configuration'>
                <Settings2 className='mr-2 h-4 w-4' />
                Configuration
              </TabsTrigger>
            </TabsList>

            <TabsContent value='access' className='mt-6 space-y-6'>
              <Card>
                <CardContent className='p-6'>
                  <h3 className='mb-6 text-lg font-bold'>
                    VPS Access Information
                  </h3>

                  <div className='grid max-w-4xl gap-6'>
                    {/* IP Address */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <div className='rounded bg-blue-100 p-1'>
                          <Monitor className='h-4 w-4 text-blue-600' />
                        </div>
                        <span className='text-sm font-semibold'>
                          IP Address
                        </span>
                      </div>
                      <div className='relative'>
                        <Input
                          readOnly
                          value={vps.ip}
                          className='h-12 bg-white pr-12 focus-visible:ring-blue-500'
                        />
                        <Button
                          variant='ghost'
                          size='icon'
                          className='absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-blue-600'
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    {/* Username */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <div className='rounded bg-green-100 p-1'>
                          <Activity className='h-4 w-4 text-green-600' />
                        </div>
                        <span className='text-sm font-semibold'>Username</span>
                      </div>
                      <div className='relative'>
                        <Input
                          readOnly
                          value={vps.username}
                          className='h-12 bg-white pr-12 focus-visible:ring-blue-500'
                        />
                        <Button
                          variant='ghost'
                          size='icon'
                          className='absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-blue-600'
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <div className='rounded bg-amber-100 p-1'>
                          <Shield className='h-4 w-4 text-amber-600' />
                        </div>
                        <span className='text-sm font-semibold'>Password</span>
                      </div>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          readOnly
                          value={vps.password}
                          className='h-12 bg-white pr-24 focus-visible:ring-blue-500'
                        />
                        <div className='absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setShowPassword(!showPassword)}
                            className='text-muted-foreground hover:text-blue-600'
                          >
                            {showPassword ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='text-muted-foreground hover:text-blue-600'
                          >
                            <Copy className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs placeholders */}
            <TabsContent value='usage' className='mt-8'>
              <Card>
                <CardContent className='flex flex-col items-center justify-center p-12 text-muted-foreground'>
                  <div className='mb-4 rounded-full bg-slate-100 p-4'>
                    <Activity className='h-8 w-8 text-slate-400' />
                  </div>
                  <p className='font-medium'>
                    Usage statistics will appear here
                  </p>
                  <p className='text-sm'>
                    Real-time CPU, RAM, and Network usage tracking.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='firewall' className='mt-8'>
              <Card>
                <CardContent className='flex flex-col items-center justify-center p-12 text-muted-foreground'>
                  <div className='mb-4 rounded-full bg-slate-100 p-4'>
                    <Shield className='h-8 w-8 text-slate-400' />
                  </div>
                  <p className='font-medium'>Firewall rules management</p>
                  <p className='text-sm'>
                    Configure inbound and outbound traffic rules for your
                    instance.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='renew' className='mt-8'>
              <Card>
                <CardContent className='flex flex-col items-center justify-center p-12 text-muted-foreground'>
                  <div className='mb-4 rounded-full bg-slate-100 p-4'>
                    <Calendar className='h-8 w-8 text-slate-400' />
                  </div>
                  <p className='font-medium'>Renew your subscription</p>
                  <p className='text-sm'>
                    Extend your VPS lease period or set up auto-renewal.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='upgrade' className='mt-8'>
              <Card>
                <CardContent className='flex flex-col items-center justify-center p-12 text-muted-foreground'>
                  <div className='mb-4 rounded-full bg-slate-100 p-4'>
                    <ArrowUpCircle className='h-8 w-8 text-slate-400' />
                  </div>
                  <p className='font-medium'>Upgrade VPS resources</p>
                  <p className='text-sm'>
                    Scale up your CPU, RAM or storage without losing data.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='configuration' className='mt-8'>
              <Card>
                <CardContent className='flex flex-col items-center justify-center p-12 text-muted-foreground'>
                  <div className='mb-4 rounded-full bg-slate-100 p-4'>
                    <Settings2 className='h-8 w-8 text-slate-400' />
                  </div>
                  <p className='font-medium'>Instance configuration</p>
                  <p className='text-sm'>
                    Manage general settings, backups, and networking details.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </Main>
    </>
  )
}
