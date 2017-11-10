import pandas as pd
from numpy import timedelta64 as td
import numpy as np

first_day = pd.Timestamp('2017-05-17')
last_day = pd.Timestamp('2017-06-05')
days = pd.date_range(first_day, last_day)
number_of_days = len(days)

mode_ids = {'': 0, 'Lava': 1, 'Krajina': 2, 'VrstevniceFill': 3, 'Spad': 4, 'Voda': 5,
            'Psychedelicky': 6, 'Vrstevnice': 7, 'Vyukovy': 8}

for day in days:
    print('Preparing day', day.date())

    start = day + td(9, 'h')
    end = day + td(18, 'h')
    seconds = pd.date_range(start, end, freq='S')

    mode_filename = '%s.%s\mode_change_%s-%s.txt' % (day.day, day.month, day.day, day.month)
    modes = pd.read_csv(mode_filename, header=None, names=['playmode', 'timestamp'], parse_dates=[1])

    modes['time'] = modes.timestamp.apply(pd.Timestamp.time)
    modes['previous_timestamp'] = modes.timestamp.shift()
    modes['previous_length'] = modes.timestamp - modes.previous_timestamp
    modes['event'] = 'automatic'
    modes.loc[modes.previous_length < td(1, 'm'), 'event'] = 'click'
    print('Modes prepared.')

    points_filename = '%s.%s\max_values_%s-%s.txt' % (day.day, day.month, day.day, day.month)
    points = pd.read_csv(points_filename, header=None, names=['overpoints', 'timestamp'], parse_dates=[1])

    points['time'] = points.timestamp.apply(pd.Timestamp.time)
    points = points[(points.time >= start.time()) & (points.time <= end.time())]
    print('Points prepared.')

    m = modes[modes.time < start.time()].tail(1).playmode
    if len(m) > 0:
        mode = m.item()
    else:
        mode = ''
    modes = modes[(modes.time >= start.time()) & (modes.time <= end.time())]

    full_table = pd.DataFrame(seconds, columns=['timestamp'])
    full_table['date'] = full_table.timestamp.apply(pd.Timestamp.date)
    full_table['time'] = full_table.timestamp.apply(pd.Timestamp.time)
    full_table = full_table.drop('timestamp', 1)

    full_table['mode'] = ''
    full_table['overpoints'] = 0
    full_table['click'] = 0

    for row in full_table.iterrows():
        p = points[points.time == row[1].time]
        if len(p) > 0:
            full_table.loc[row[0], 'overpoints'] = int(sum(p['overpoints']) / len(p))
        m = modes[modes.time == row[1].time]
        if len(m) >= 1:
            mode = m.tail(1).playmode.item()
            if m.tail(1).event.item() == 'click':
                full_table.loc[row[0], 'click'] = 1
        full_table.loc[row[0], 'mode'] = mode

    full_table['mode_id'] = full_table['mode'].apply(lambda x: mode_ids[x])
    full_table = full_table.drop('mode', 1)

    full_filename = 'full_%s-%s.csv' % (day.day, day.month)
    full_table.to_csv(full_filename, index=False)
    print('Full table written.')
