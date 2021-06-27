import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';

import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
