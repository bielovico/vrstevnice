import pandas as pd
from numpy import timedelta64 as td

length = 30
longest_length = 20
speed = 0.05

sessions = pd.read_csv('sessions_continue.csv', parse_dates=[1, 2, 3])
sessions.session_start = sessions.session_start.apply(pd.Timestamp.time)
sessions.session_end = sessions.session_end.apply(pd.Timestamp.time)
sessions.date = sessions.date.apply(pd.Timestamp.date)

condition = (sessions.mode_changes_per_second <= speed)\
            & (sessions.session_length >= length)\
            & (sessions.longest_length >= longest_length)

sessions['productive'] = condition*1  # just to make it short in csv
sessions.to_csv('sessions_continue.csv', index=False)

first_day = pd.Timestamp('2017-04-26')
last_day = pd.Timestamp('2017-06-05')
days = pd.date_range(first_day, last_day)
number_of_days = len(days)

columns = ['date', 'session_start', 'session_end', 'session_length', 'longest_length', 'mode_changes_per_second',
           'mode0', 'mode1', 'mode2', 'mode3', 'mode4', 'mode5', 'mode6', 'mode7', 'mode8']

for day in days:
    date = day.date()
    print('Preparing day', date)

    full_filename = 'online visualization/full_%s-%s.csv' % (day.day, day.month)
    full = pd.read_csv(full_filename, parse_dates=[1])
    full['time'] = full['time'].apply(pd.Timestamp.time)
    full['productive'] = 0

    day_sessions = sessions[(sessions.date == date) & (sessions.productive == 1)]

    for _, session in day_sessions.iterrows():
        full.loc[(full['time'] >= session.session_start) & (full['time'] <= session.session_end), 'productive'] = 1

    full.to_csv(full_filename, index=False)
