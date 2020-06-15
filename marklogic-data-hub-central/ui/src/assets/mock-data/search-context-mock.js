import Curate from '../../pages/Curate';
import Load from "../../pages/Load";
import Run from "../../pages/Run";
import React from 'react'

export const setViewLoadFunction = {
  searchOptions: {
    view: <Load/>
  },
  setView: jest.fn()
}

export const setViewCurateFunction = {
    searchOptions: {
      view: <Curate/>
  },
  setView: jest.fn()
}

export const setViewRunFunction = {
    searchOptions: {
      view: <Run/>
  },
  setView: jest.fn()
}
