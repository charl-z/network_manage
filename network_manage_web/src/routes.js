import { makeModuleRoute } from "./libs/router";

import homeRoutes from './pages/dashboard/routes'
import networkRoutes from './pages/network/routes';

export default [
  makeModuleRoute('/home', homeRoutes),
  makeModuleRoute('/network', networkRoutes),
]
