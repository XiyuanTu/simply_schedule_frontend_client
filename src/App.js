import { Box, Button, Typography } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import './App.css';
import { NavBar } from './components/NavBar/NavBar';
import SchedulePage from './features/Calendar/SchedulePage';
import moment from 'moment';
import * as CalendarViewConstants from './common/constants/calendarView';
import Login from './components/Login';
import * as AuthStatus from './common/constants/authStatus';
import { useGetUserQuery } from './app/services/userApiSlice';
import { useSelector } from 'react-redux';

function App() {
  const height = 48;
  const py = 8;

  const { status } = useSelector((state) => state.auth);
  const { isFetching } = useGetUserQuery(null, {
    skip: status != AuthStatus.AUTHENTICATED,
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState(CalendarViewConstants.WEEK);
  const [calendarRange, setCalendarRange] = useState({
    start: moment().startOf('week'),
    end: moment().endOf('week'),
  });

  useEffect(() => {
    setCalendarRange({
      start: moment(calendarDate).startOf('week'),
      end: moment(calendarDate).endOf('week'),
    });
  }, [calendarDate]);

  return (
    <Fragment>
      <Box sx={{ height: '100vh', bgcolor: '#f8fafe' }}>
        <Box sx={{ height: height, py: `${py}px` }}>
          <NavBar
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            calendarRange={calendarRange}
            setCalendarDate={setCalendarDate}
          />
        </Box>
        <SchedulePage
          navBarHeight={height + 2 * py}
          calendarView={calendarView}
          setCalendarRange={setCalendarRange}
          calendarDate={calendarDate}
          setCalendarDate={setCalendarDate}
        />
      </Box>
      <Login />
    </Fragment>
  );
}

export default App;
