import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import { IDaySchedules } from 'src/provider/entity/provider-information.entity';
import { memoize } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { weekDays } from '../constants/weekdays.constants';
dayjs.extend(duration);

export const daysOfTheMonth = (
  dateObj: {
    year?: number;
    // month: number;
    holidays?: number[];
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    providerDaySchedules?: IDaySchedules;
  },
  format = 'YYYY-MM-DD'
) => {
  // eslint-disable-next-line prefer-const

  let {
    year,
    startDate,
    endDate,
    // eslint-disable-next-line prefer-const
    holidays = [],
    // eslint-disable-next-line prefer-const
    providerDaySchedules
  } = dateObj;
  // month is always one less than expected. 0 for jan and 11 for dec
  const month = dayjs(startDate).month();
  year = year ?? dayjs().year();
  const startOfMonth = dayjs(`${year}-${month}`, 'YYYY-M').startOf('month');
  const endOfMonth = dayjs(`${year}-${month}`, 'YYYY-M').endOf('month');
  startDate =
    startDate ?? dayjs(`${year}-${month}-${startOfMonth.date()}`, 'YYYY-M-D');
  endDate =
    endDate ?? dayjs(`${year}-${month}-${endOfMonth.date()}`, 'YYYY-M-D');
  const days: Array<{
    date: string;
    startTime: string | null;
    endTime: string | null;
  }> = [];

  const getDayStartEndTimeMemoizeFn = memoize(getDayStartEndTime);
  const pushDaysFn = (startDate: dayjs.Dayjs) => {
    const { startTime, endTime } = getDayStartEndTimeMemoizeFn(
      weekDays[startDate.day()],
      providerDaySchedules
    );
    days.push({
      date: startDate.format(format),
      startTime: startTime,
      endTime: endTime
    });
  };
  if (!isHoliday(holidays, startDate.day())) {
    pushDaysFn(startDate);
  }
  while (!startDate.isSame(endDate)) {
    startDate = startDate.add(1, 'day');
    if (isHoliday(holidays, startDate.day())) {
      continue;
    }
    pushDaysFn(startDate);
  }
  return days;
};

const getDayStartEndTime = (
  day: string,
  daySchedules: IDaySchedules
): { startTime: string | null; endTime: string | null } => {
  return daySchedules?.[day]
    ? daySchedules[day]
    : { startTime: null, endTime: null };
};

const isHoliday = (holidays: number[], currentDay: number) =>
  holidays.includes(currentDay);

export const getTimeFn = (time: string, additionalTime = 0) => {
  const hours = Number(time.split(':')[0]);
  const minutes = Number(time.split(':')[1]);
  return dayjs
    .duration({ hours, minutes })
    .add(additionalTime, 'minute')
    .format('HH:mm');
};

export const getTimeDurationFn = (time: string) => {
  const hours = Number(time.split(':')[0]);
  const minutes = Number(time.split(':')[1]);
  return dayjs.duration({ hours, minutes }).asSeconds();
};

export const daySchedules = (
  startTime: string,
  endTime: string,
  additionalTime: number
) => {
  const times = [];

  let startTimeNumber = getTimeDurationFn(startTime);
  const endTimeNumber = getTimeDurationFn(endTime);

  while (startTimeNumber < endTimeNumber) {
    const formattedStartTime = getTimeFn(startTime);
    const formattedEndTime = getTimeFn(startTime, additionalTime);
    times.push({
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      isBooked: false,
      id: uuidv4()
    });
    startTimeNumber = getTimeDurationFn(formattedEndTime);
    startTime = formattedEndTime;
  }
  return times;
};

export const checkValidDate = (date: string, format = 'YYYY-MM-DD') => {
  return dayjs(date, format).isValid();
};
