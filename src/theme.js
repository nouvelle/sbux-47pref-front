import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#ffffff',
      main: '#edebe9',
      dark: '#bbb9b7',
      contrastText: '#000',
    },
    secondary: {
      light: '#409469',
      main: '#00653e',
      dark: '#003917',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: ['"M PLUS 1p"', 'sans-serif'].join(','),
  },
});

export default theme;