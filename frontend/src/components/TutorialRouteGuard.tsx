import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTutorialContext } from '../hooks/useTutorialContext'

export function TutorialRouteGuard() {
  const { appEnabled } = useTutorialContext()
  const location = useLocation()

  if (!appEnabled && location.pathname !== '/') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
