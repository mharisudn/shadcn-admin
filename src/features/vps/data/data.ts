import { type VPS } from './schema'

export const vpsInstances: VPS[] = [
  {
    id: 'vps-1234',
    name: 'prod-web-01',
    ip: '192.168.1.10',
    os: 'Ubuntu 22.04 LTS',
    status: 'running',
    region: 'us-east-1',
    created: '2024-01-15',
    autoRenew: true,
  },
  {
    id: 'vps-5678',
    name: 'dev-db-01',
    ip: '192.168.1.11',
    os: 'Debian 12',
    status: 'stopped',
    region: 'eu-central-1',
    created: '2024-02-10',
    autoRenew: false,
  },
  {
    id: 'vps-9012',
    name: 'staging-app',
    ip: '192.168.1.12',
    os: 'Ubuntu 20.04 LTS',
    status: 'running',
    region: 'ap-southeast-1',
    created: '2024-02-01',
    autoRenew: true,
  },
  {
    id: 'vps-3456',
    name: 'api-gateway',
    ip: '192.168.1.13',
    os: 'CentOS 8',
    status: 'running',
    region: 'us-west-2',
    created: '2024-01-20',
    autoRenew: true,
  },
  {
    id: 'vps-7890',
    name: 'cache-server',
    ip: '192.168.1.14',
    os: 'Ubuntu 22.04 LTS',
    status: 'stopped',
    region: 'eu-west-1',
    created: '2024-02-05',
    autoRenew: false,
  },
  {
    id: 'vps-1111',
    name: 'monitoring',
    ip: '192.168.1.15',
    os: 'Debian 11',
    status: 'running',
    region: 'ap-northeast-1',
    created: '2024-01-25',
    autoRenew: true,
  },
]

export const statuses = [
  {
    value: 'running',
    label: 'Running',
    icon: null,
  },
  {
    value: 'stopped',
    label: 'Stopped',
    icon: null,
  },
  {
    value: 'pending',
    label: 'Pending',
    icon: null,
  },
]

export const regions = [
  {
    value: 'us-east-1',
    label: 'US East 1',
  },
  {
    value: 'us-west-2',
    label: 'US West 2',
  },
  {
    value: 'eu-central-1',
    label: 'EU Central 1',
  },
  {
    value: 'eu-west-1',
    label: 'EU West 1',
  },
  {
    value: 'ap-southeast-1',
    label: 'AP Southeast 1',
  },
  {
    value: 'ap-northeast-1',
    label: 'AP Northeast 1',
  },
]
