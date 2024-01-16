import {useState, useCallback} from 'react';

export default function DatePicker() {
  const [{month, year}, setDate] = useState({month: 1, year: 2018});
  const [selectedDates, setSelectedDates] = useState({
    start: new Date('Wed Feb 07 2018 00:00:00 GMT-0500 (EST)'),
    end: new Date('Sat Feb 10 2018 00:00:00 GMT-0500 (EST)'),
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({month, year}),
    [],
  );

  return (
    <h1>hello</h1>
  );
}