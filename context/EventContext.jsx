"use client"

import React, { createContext, useContext } from 'react';

const EventContext = createContext(null);

export const EventProvider = ({ value, children }) => {
  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  return useContext(EventContext);
};
