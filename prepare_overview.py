import pandas as pd
from numpy import timedelta64 as td
import numpy as np

first_day = pd.Timestamp('2017-04-26')
last_day = pd.Timestamp('2017-06-05')
days = pd.date_range(first_day, last_day)
number_of_days = len(days)

overview_list = []
columns = ['date', 'start_time', 'points_mean', 'mode']

for day in days:
    date = day.date()
    print('Preparing day', date)

    full_filename = 'processed data/daily data/full_%s-%s.csv' % (day.day, day.month)
    times = pd.read_csv(full_filename)
    times.loc[times.productive == 0, 'overpoints'] = 0
    for i in range(0, 32402, 30):
        st = times.iloc[i].time
        pm = int(np.mean(times.iloc[i:i+30].overpoints))
        m = np.argmax(np.bincount(times.iloc[i:i+30].mode_id, minlength=9))
        overview_list.append([date, st, pm, m])

overview = pd.DataFrame(data=overview_list, columns=columns)
overview['saturation'] = overview.points_mean/np.max(overview.points_mean)

overview.to_csv('overview_productive.csv', index=False)
