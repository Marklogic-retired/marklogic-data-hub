import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserContext } from "./store/UserContext";
import MetricsProvider from "./store/MetricsContext";
import SearchProvider from "./store/SearchContext";
import DetailProvider from "./store/DetailContext";
import Dashboard from "./views/Dashboard";
import Detail from "./views/Detail";
import Search from "./views/Search";
import Header from "./views/Header"; 


import "./App.scss";

type Props = {};

const App: React.FC<Props> = (props) => {

  const userContext = useContext(UserContext);

  if (!userContext.loginAddress) {
    userContext.handleGetLoginAddress();
  }

  return (
    <Router>
      <MetricsProvider>
        <SearchProvider>
          <DetailProvider>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<Search />} />
                <Route path="/detail" element={<Detail />} />
              </Routes>
            </main>
          </DetailProvider>
        </SearchProvider>
      </MetricsProvider>
    </Router>
  );

};

export default App;
