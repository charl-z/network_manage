import { makeRoute } from "../../libs/router";
import DeviceQueryList from './device_query/device_query_task';
import DeviceQueryDetail from './device_query/device_query_detail';
import DevicePortToARP from './device_query/device_port_arps';
import DevicePortToMAC from './device_query/device_port_macs';
import NetworkQueryList from './network_query/network_query_task';
import NetworkQueryDetail from './network_query/network_query_detail'
import TCPPortDetail from './network_query/tcp_ports_details'


export default [
  makeRoute('/device_query', DeviceQueryList),
  makeRoute('/network_query', NetworkQueryList),
  makeRoute('/device_details/:id', DeviceQueryDetail),
  makeRoute('/device_details/arp_table/:id', DevicePortToARP),
  makeRoute('/device_details/brige_macs/:id', DevicePortToMAC),
  makeRoute('/network_details/:id', NetworkQueryDetail),
  makeRoute('/network_details/tcp_port_list/:id', TCPPortDetail), 
]
