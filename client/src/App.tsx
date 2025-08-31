import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/Footer/Footer'
import Navigation from './components/Navigation/Navigation'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import HouseholdLayout from './layouts/HouseholdLayout/HouseholdLayout'
import FlowerDetail from './pages/FlowerDetail/FlowerDetail'
import FlowerList from './pages/FlowerList/FlowerList'
import Home from './pages/Home/Home'
import HouseholdsMain from './pages/HouseHold/HouseholdsMain/HouseholdsMain'
import Login from './pages/Login/Login'
import Members from './pages/Members/Members'
import NotFound from './pages/NotFound/NotFound'
import Notifications from './pages/Notifications/Notifications'
import Register from './pages/Register/Register'
import SmartPotDetail from './pages/SmartPotDetail/SmartPotDetail'
import SmartPotList from './pages/SmartPotList/SmartPotList'
import UserProfile from './pages/UserProfile/UserProfile'
import { selectUser } from './redux/selectors/authSelectors'
import { selectWebSocketStatus } from './redux/selectors/measurementSelectors'
import { checkAuthStatus } from './redux/slices/authSlice'
import {
    cleanupWebSocket,
    initializeWebSocket,
    startWebSocketConnection,
    stopWebSocketConnection,
} from './redux/slices/measurementsSlice'
import { AppDispatch } from './redux/store/store'

const App = () => {
    const dispatch = useDispatch<AppDispatch>()
    const user = useSelector(selectUser)
    const webSocketStatus = useSelector(selectWebSocketStatus)

    useEffect(() => {
        const initializeApp = async () => {
          
            try {
                await dispatch(checkAuthStatus())
                
                initializeWebSocket(dispatch)
            } catch (error) {
                console.error('Error during initialization:', error)
            }
        }
        initializeApp()
    }, [dispatch])

    useEffect(() => {
        if (user && ['disconnected', 'error', 'idle'].includes(webSocketStatus)) {
            dispatch(startWebSocketConnection())
        }
    }, [dispatch, user, webSocketStatus])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                dispatch(startWebSocketConnection())
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [dispatch, user])

    useEffect(() => {
        if (user) {
            dispatch(startWebSocketConnection())
        } else {
            dispatch(stopWebSocketConnection())
            dispatch(cleanupWebSocket())
        }
    }, [dispatch, user])

    return (
        <Router>
            <Navigation />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/userProfile" element={<UserProfile />} />

                    <Route path="/households" element={<HouseholdsMain />} />

                    <Route path="/households/:householdId" element={<HouseholdLayout />}>
                        <Route path="flowers" element={<FlowerList />} />
                        <Route path="flowers/:flowerId" element={<FlowerDetail />} />

                        <Route path="members" element={<Members />} />

                        <Route path="smartPots" element={<SmartPotList />} />
                        <Route path="smartPots/:smartPotId" element={<SmartPotDetail />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </Router>
    )
}

export default App
