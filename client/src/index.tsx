import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import './i18n'
import { initializeStore, store } from './redux/store/store'
import './styles/global.sass'


initializeStore()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <Provider store={store}>
        <App />
    </Provider>,
)
