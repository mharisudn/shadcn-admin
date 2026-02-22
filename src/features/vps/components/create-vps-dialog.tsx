import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CreateVPSDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' /> Provision VPS
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Provision New VPS</DialogTitle>
          <DialogDescription>
            Configure your virtual private server instance.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input id='name' placeholder='prod-db-01' className='col-span-3' />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='os' className='text-right'>
              OS Image
            </Label>
            <Select>
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select OS' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ubuntu-22'>Ubuntu 22.04 LTS</SelectItem>
                <SelectItem value='ubuntu-20'>Ubuntu 20.04 LTS</SelectItem>
                <SelectItem value='debian-12'>Debian 12</SelectItem>
                <SelectItem value='centos-9'>CentOS Stream 9</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='region' className='text-right'>
              Region
            </Label>
            <Select>
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select Region' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='us-east-1'>US East (N. Virginia)</SelectItem>
                <SelectItem value='eu-central-1'>
                  EU Central (Frankfurt)
                </SelectItem>
                <SelectItem value='ap-southeast-1'>
                  Asia Pacific (Singapore)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='size' className='text-right'>
              Size
            </Label>
            <Select>
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select Size' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='s-1vcpu-1gb'>1 vCPU / 1GB RAM</SelectItem>
                <SelectItem value='s-1vcpu-2gb'>1 vCPU / 2GB RAM</SelectItem>
                <SelectItem value='s-2vcpu-4gb'>2 vCPU / 4GB RAM</SelectItem>
                <SelectItem value='s-4vcpu-8gb'>4 vCPU / 8GB RAM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type='submit'>Provision</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
