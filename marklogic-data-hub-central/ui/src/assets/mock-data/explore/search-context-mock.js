import {defaultSearchContext, defaultSearchOptions} from "@util/search-context";

import Curate from "../../../pages/Curate";
import Load from "../../../pages/Load";
import React from "react";
import Run from "../../../pages/Run";

export const setViewLoadFunction = {
  ...defaultSearchContext,
  searchOptions: {
    ...defaultSearchOptions,
    view: <Load/>
  },
  setView: jest.fn()
};

export const setViewCurateFunction = {
  ...defaultSearchContext,
  searchOptions: {
    ...defaultSearchOptions,
    view: <Curate/>
  },
  setView: jest.fn()
};

export const setViewRunFunction = {
  ...defaultSearchContext,
  searchOptions: {
    ...defaultSearchOptions,
    view: <Run/>
  },
  setView: jest.fn()
};

