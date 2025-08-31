import { MeasurementValue } from '../../types/flowerTypes'
import { addInvite, loadInvites } from '../slices/invitesSlice'
import { measurementsSlice } from '../slices/measurementsSlice'
import { AppDispatch } from '../store/store'

class WebSocketService {
    private ws: WebSocket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectTimeout = 3000
    private dispatch: AppDispatch | null = null
    private isIntentionalDisconnect = false
    private token: string | null = null
    private reconnectTimer: NodeJS.Timeout | null = null
    private heartbeatInterval: NodeJS.Timeout | null = null
    private lastPongTime: number = Date.now()

    constructor() {
        this.token = localStorage.getItem('token')
        
    }

    setDispatch(dispatch: AppDispatch) {
        this.dispatch = dispatch
        
    }

    prepareForIntentionalDisconnect() {
        
        this.isIntentionalDisconnect = true
    }

    private startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }
        
        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                
                this.sendMessage({ type: 'ping' })
                if (Date.now() - this.lastPongTime > 10000) {
                    
                    this.ws.close()
                }
            } else {
                
                this.ws?.close()
            }
        }, 5000)
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
    }

    connect() {
        
        if (this.ws) {
            
            this.ws.close()
            this.ws = null
        }

        this.isIntentionalDisconnect = false
        this.lastPongTime = Date.now()

        this.token = localStorage.getItem('token')
        if (!this.token) {
            
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
            }
            return
        }

        try {
            const tokenParts = this.token.split('.')
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format')
            }
            const payload = JSON.parse(atob(tokenParts[1]))

            if (!payload.user || !payload.user.id) {
                throw new Error('Invalid token structure - missing user.id')
            }
            
        } catch (error) {
            console.error('Token validation failed:', error)
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
            }
            return
        }

        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'
        const wsUrl = `${baseUrl.replace('http', 'ws')}/ws?token=${encodeURIComponent(this.token)}`
        

        try {
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                
                this.reconnectAttempts = 0
                this.lastPongTime = Date.now()
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('connected'))
                }
                this.startHeartbeat()
            }

            this.ws.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)
                    

                    if (!this.dispatch) {
                        
                        return
                    }

                    if (message.message && message.message.startsWith('Welcome')) {
                        return
                    }

                    if (message.echo) {
                        try {
                            const echoData = JSON.parse(message.echo)
                            if (echoData.type === 'ping') {
                                this.lastPongTime = Date.now()
                            }
                        } catch (error) {
                            console.error('Error parsing echo message:', error)
                        }
                        return
                    }

                    if (message.wsType === 'measurement') {
                        const measurementData = {
                            typeOfData: message.data.typeOfData === 'soil' ? 'humidity' : message.data.typeOfData,
                            value: message.data.value,
                            flower_id: message.data.flower_id,
                            createdAt: message.data.createdAt,
                            updatedAt: message.data.updatedAt,
                            _id: message.data._id || Date.now().toString(),
                        }

                        this.dispatch(
                            measurementsSlice.actions.addMeasurement({
                                flowerId: message.data.flower_id,
                                measurement: this.createMeasurementFromData(measurementData),
                            }),
                        )
                        return
                    }

                    if (message.wsType === 'invite') {
                        if (this.dispatch) {
                            this.dispatch(addInvite(message.data))
                        } else {
                           
                        }
                        return
                    }

                    if (message.wsType === 'household_decision') {
                      
                        if (this.dispatch) {
                            
                            this.dispatch(loadInvites())
                            
                        }
                        return
                    }

                    
                    switch (message.type) {
                        case 'pong':
                            
                            this.lastPongTime = Date.now()
                            break
                        case 'error':
                            break
                        case 'confirmation':
                            break
                        default:
                            
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error)
                }
            }

            this.ws.onclose = event => {
                
                this.stopHeartbeat()
                if (this.isIntentionalDisconnect) {
                    
                    if (this.dispatch) {
                        this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                    }
                    this.isIntentionalDisconnect = false
                } else {
                    
                    this.handleReconnect()
                }
                this.ws = null
            }

            this.ws.onerror = error => {
                console.error('WebSocket error:', error)
                this.stopHeartbeat()
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
                }
                this.handleReconnect()
            }
        } catch (error) {
            console.error('Error creating WebSocket connection:', error)
            this.stopHeartbeat()
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
            }
            this.handleReconnect()
        }
    }

    private handleReconnect() {
        if (this.isIntentionalDisconnect) {
            
            return
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            

            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('reconnecting'))
            }

            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000)
            

            this.reconnectTimer = setTimeout(() => {
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('connecting'))
                    this.connect()
                }
            }, delay)
        } else {
            
            this.reconnectTimer = setTimeout(() => {
                this.reconnectAttempts = 0
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('connecting'))
                    this.connect()
                }
            }, 60000)
        }
    }

    sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        } 
    }

    disconnect() {
        
        this.stopHeartbeat()
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                this.ws.close()
            } else {
                if (this.isIntentionalDisconnect && this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                }
            }
            this.ws = null
        } else {
            if (this.isIntentionalDisconnect && this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                this.isIntentionalDisconnect = false
            }
        }
    }

    private createMeasurementFromData(data: any): MeasurementValue {
        const createdAt = typeof data.createdAt === 'number' ? new Date(data.createdAt).toISOString() : data.createdAt
        const updatedAt =
            typeof data.updatedAt === 'number' ? new Date(data.updatedAt).toISOString() : data.updatedAt || createdAt

        return {
            _id: data._id || Date.now().toString(),
            typeOfData: data.typeOfData,
            value: data.value,
            createdAt,
            updatedAt,
            flower_id: data.flower_id,
        }
    }
}

export const webSocketService = new WebSocketService()
