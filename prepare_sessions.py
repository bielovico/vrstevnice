import pandas as pd
from numpy import timedelta64 as td
import numpy as np

first_day = pd.Timestamp('26-04-2017')
last_day = pd.Timestamp('05-06-2017')
days = pd.date_range(first_day, last_day)
number_of_days = len(days)

sessions_list = []
columns = ['date', 'session_start', 'session_end', 'session_length', 'longest_length', 'mode_changes_per_second',
           'mode0', 'mode1', 'mode2', 'mode3', 'mode4', 'mode5', 'mode6', 'mode7', 'mode8']

for day in days:
    date = day.date()
    print('Preparing day', date)

    start = day + td(9, 'h')
    end = day + td(18, 'h')

    points_filename = 'original data\%s.%s\max_values_%s-%s.txt' % (day.day, day.month, day.day, day.month)
    points = pd.read_csv(points_filename, header=None, names=['overpoints', 'timestamp'], parse_dates=[1])
    if points.empty:
        continue
    points['time'] = points.timestamp.apply(pd.Timestamp.time)
    points = points[(points.time >= start.time()) & (points.time <= end.time())]
    points['previous_timestamp'] = points.timestamp.shift()
    points['difference'] = (points.timestamp - points.previous_timestamp).fillna(0)
    points['difference_seconds'] = points['difference'].apply(lambda x: x.seconds)

    full_filename = 'online visualization/full_%s-%s.csv' % (day.day, day.month)
    full = pd.read_csv(full_filename, parse_dates=[1])
    full['time'] = full['time'].apply(pd.Timestamp.time)

    s_start = points.head(1).time.item()
    p_time = s_start

    modes = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    longest_in_mode = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    mode_changes = 0
    current_mode = 0
    current_length = 0

    for _, row in points.iterrows():
        if row.difference > td(3, 's'):
            full_session = full['mode_id'][(full['time'] >= s_start) & (full['time'] <= p_time)]
            current_mode = full_session.iloc[0]
            for i in range(len(full_session)):
                if full_session.iloc[i] != current_mode:
                    mode_changes += 1
                    if current_length > longest_in_mode[full_session.iloc[i]]:
                        longest_in_mode[current_mode] = current_length
                    current_length = 0
                    current_mode = full_session.iloc[i]
                modes[full_session.iloc[i]] += 1
                current_length += 1
            if current_length > longest_in_mode[full_session.iloc[i]]:
                longest_in_mode[current_mode] = current_length

            session_length = (pd.Timestamp.combine(date, p_time) - pd.Timestamp.combine(date, s_start)).seconds + 1
            session = [date, s_start, p_time, session_length, max(longest_in_mode), mode_changes/session_length]
            session.extend(modes)
            sessions_list.append(session)

            s_start = row.time
            modes = [0, 0, 0, 0, 0, 0, 0, 0, 0]
            longest_in_mode = [0, 0, 0, 0, 0, 0, 0, 0, 0]
            mode_changes = 0
            current_mode = 0
            current_length = 0

        p_time = row.time

sessions = pd.DataFrame(data=sessions_list, columns=columns)

sessions.to_csv('sessions_continue.csv', index_label='id', float_format='%.4f')
