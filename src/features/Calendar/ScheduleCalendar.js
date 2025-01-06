import { Box } from '@mui/material';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndProp from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useGetOpenHoursQuery } from '../../app/services/openHourApiSlice';
import { useGetSlotsQuery } from '../../app/services/slotApiSlice';
import * as SlotStatusConstants from '../../common/constants/slotStatus';
import {
  convertSlots,
  isAvailable,
  isOpenHour,
  isOverlapped,
} from '../../common/util/slotUtil';
import CustomEventComponent from './CustomEventComponent';
import { selectCombinedOpenHours } from './openHourSlice';

const moment = extendMoment(Moment);
const localizer = momentLocalizer(Moment);
const timeFormat = 'YYYY-MM-DD[T]HH:mm:ss';
const DnDCalendar = withDragAndProp(Calendar);

export default function ScheduleCalendar({
  navBarHeight,
  availableSlots,
  setAvailableSlots,
}) {
  const {
    data: slots,
    isFetching,
    isSuccess,
  } = useGetSlotsQuery(
    { studentId: 10, coachId: 10 },
    {
      selectFromResult: (result) => {
        result.data = convertSlots(result.data ?? []);
        return result;
      },
    }
  );

  const {
    data: openHours,
    isFetching: isFetchingOpenHours,
    isSuccess: isOpenHoursSuccess,
  } = useGetOpenHoursQuery({ coachId: 10 });

  useEffect(() => {
    console.log('slots', slots);
  }, [slots]);
  useEffect(() => {
    console.log('availableSlots', availableSlots);
  }, [availableSlots]);
  const combinedOpenHours = useSelector(selectCombinedOpenHours);

  const dispatch = useDispatch();
  const onChangeSlotTime = useCallback(
    (start, end, id) => {
      if (
        isOverlapped([...slots, ...availableSlots], start, end, id) ||
        !isAvailable(combinedOpenHours, start, end)
      ) {
        // todo: notifications
        return;
      }

      setAvailableSlots((prev) => {
        let slot = prev.find((slot) => slot.id === id);
        slot.start = start;
        slot.end = end;
        return prev;
      });
    },
    [slots, availableSlots]
  );

  const onSelect = useCallback(
    (start, end) => {
      if (
        !isAvailable(combinedOpenHours, start, end) ||
        isOverlapped([...slots, ...availableSlots], start, end)
      ) {
        // todo: notifications
        return;
      }
      setAvailableSlots((prev) => [
        ...prev,
        {
          id: uuidv4(),
          start: start,
          end: end,
          status: SlotStatusConstants.AVAILABLE,
          isDraggable: true,
        },
      ]);
    },
    [slots, combinedOpenHours, availableSlots]
  );

  const slotPropGetter = useCallback(
    (date) => {
      if (isOpenHoursSuccess) {
        return {
          ...(!isOpenHour(openHours, moment(date)) && {
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              borderTop: 'none',
            },
          }),
        };
      }
    },
    [openHours, isOpenHoursSuccess]
  );

  if (isFetching) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box style={{ height: `calc(100% - ${navBarHeight}px)` }}>
      <DnDCalendar
        localizer={localizer}
        events={[...availableSlots, ...slots]}
        draggableAccessor={'isDraggable'}
        views={['month', 'week']}
        defaultView="week"
        // drilldownView="week"
        onEventDrop={({ start, end, event }) => {
          if (start.getDay() === end.getDay()) {
            onChangeSlotTime(start, end, event.id);
          }
        }}
        onEventResize={({ start, end, event }) => {
          onChangeSlotTime(start, end, event.id);
        }}
        selectable={'true'}
        onSelectSlot={({ start, end }) => {
          onSelect(start, end);
        }}
        // eventPropGetter={(event) => {
        //     const backgroundColor = 'yellow';
        //     return { style: { backgroundColor } }
        // }}
        slotPropGetter={slotPropGetter}
        components={{
          event: (props) => (
            <CustomEventComponent
              setAvailableSlots={setAvailableSlots}
              {...props}
            />
          ),
        }}
      />
    </Box>
  );
}