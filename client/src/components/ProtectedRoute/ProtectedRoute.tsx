import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectUser } from '../../redux/selectors/authSelectors'

const ProtectedRoute: React.FC = () => {
    const user = useSelector(selectUser)
    
    return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute