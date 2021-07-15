import React, { createContext, useState } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';

import Header from './components/Header';
import Footer from './components/Footer';

export const DataContext = createContext("");

const App = () => {
  const [prefList, setPrefList] = useState();
  const [imgFromS3, setImgFromS3] = useState({});
  const [isNeedGetLatestImageList, setIsNeedGetLatestImageList] = useState({ state: "all", pref: "", image: "" });
  const prefListState = { isNeedGetLatestImageList, setIsNeedGetLatestImageList, prefList, setPrefList, imgFromS3, setImgFromS3 };

  return (
    <ThemeProvider theme={theme}>
      <DataContext.Provider value={prefListState}>
        <Header />
        <Footer />
      </DataContext.Provider>
    </ThemeProvider>
  );
}

export default App;
