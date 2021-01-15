import React, { Fragment } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import ReactRouterBootstrap from './router'
import './App.css';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ReactRouterBootstrap />
      </ThemeProvider>
    </Fragment>
  );
}

export default App;
