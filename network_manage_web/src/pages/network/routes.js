import { makeRoute } from "../../libs/router";
import DeviceQueryList from './device_query/device_query_task';
import DeviceQueryDetail from './device_query/device_query_detail';
import DevicePortToARP from './device_query/device_port_arps';
import DevicePortToMAC from './device_query/device_port_macs';
import NetworkQueryList from './network_query/network_query_task';
import NetworkQueryDetail from './network_query/network_query_detail'
import PortDetail from './network_query/ports_details'
import NetworkManage from './network_manage/'
import IpDetails from './network_manage/ip_details'


export default [
  makeRoute('/network_manage', NetworkManage),
  makeRoute('/network_manage/:id', IpDetails),
  makeRoute('/device_query', DeviceQueryList),
  makeRoute('/network_query', NetworkQueryList),
  makeRoute('/device_details/:id', DeviceQueryDetail),
  makeRoute('/device_details/arp_table/:id', DevicePortToARP),
  makeRoute('/device_details/brige_macs/:id', DevicePortToMAC),
  makeRoute('/network_details/:id', NetworkQueryDetail),
  makeRoute('/network_details/tcp_port_list/:id', PortDetail),
  makeRoute('/network_details/udp_port_list/:id', PortDetail),
]
