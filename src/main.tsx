import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

import { AuthProvider } from './context/AuthContext.tsx'
import { GameProvider } from './context/GameContext.tsx'

const darkTheme = createTheme({ palette: { mode: 'dark' } });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider theme={darkTheme}>
                <AuthProvider>
                    <GameProvider>
                        <CssBaseline />
                        <App />
                    </GameProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
)