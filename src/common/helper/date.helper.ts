import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import { v4 as uuidv4 } from 'uuid';
dayjs.extend(duration);

export const daysOfTheMonth = (
  dateObj: {
    year?: number;
    // month: number;
    holidays?: number[];
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
  },
  format = 'YYYY-MM-DD'
) => {
  let { year, startDate, endDate, holidays = [] } = dateObj;
  // month is always one less than expected. 0 for jan and 11 for dec
  const month = dayjs(startDate).month();
  year = year ?? dayjs().year();
  const startOfMonth = dayjs(`${year}-${month}`, 'YYYY-M').startOf('month');
  const endOfMonth = dayjs(`${year}-${month}`, 'YYYY-M').endOf('month');
  startDate =
    startDate ?? dayjs(`${year}-${month}-${startOfMonth.date()}`, 'YYYY-M-D');
  endDate =
    endDate ?? dayjs(`${year}-${month}-${endOfMonth.date()}`, 'YYYY-M-D');
  let days = [];
  if (!isHoliday(holidays, startDate.day()))
    days.push(startDate.format(format));
  while (!startDate.isSame(endDate)) {
    startDate = startDate.add(1, 'day');
    if (isHoliday(holidays, startDate.day())) {
      continue;
    }
    days.push(startDate.format(format));
  }
  return days;
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
  let endTimeNumber = getTimeDurationFn(endTime);

  while (startTimeNumber < endTimeNumber) {
    let formattedStartTime = getTimeFn(startTime);
    let formattedEndTime = getTimeFn(startTime, additionalTime);
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
