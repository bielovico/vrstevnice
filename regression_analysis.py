import pandas as pd
from numpy import timedelta64 as td
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
import mord

minute = td(1, 'm')
video_end = pd.Timestamp('26-04-2017T16:00:00')
end = pd.Timestamp('26-04-2017T18:00:00')

modes = pd.read_csv('original data/26.4/mode_change_26-4.txt',
                    header=None, names=['playmode', 'timestamp'], parse_dates=[1])

modes['previous_timestamp'] = modes.timestamp.shift()
modes['previous_length'] = modes.timestamp - modes.previous_timestamp
modes['length'] = modes.timestamp.shift(-1) - modes.timestamp
modes['to_video_end'] = end - modes.timestamp
modes['event'] = 'automatic'
modes.loc[modes.previous_length < minute, 'event'] = 'click'

# print(modes[modes.to_video_end > td(0)].loc[:, ['playmode', 'previous_length', 'length']])

points = pd.read_csv('original data/26.4/max_values_26-4.txt',
                     header=None, names=['overpoints', 'timestamp'], parse_dates=[1])
points['previous_timestamp'] = points.timestamp.shift()
points['to_end'] = end - points.timestamp
points['difference'] = (points.timestamp - points.previous_timestamp).fillna(0)
points['difference_seconds'] = points['difference'].apply(lambda x: x.seconds)
points['overpoints_mean'] = 0
points['session_id'] = int(0)
points['session_length'] = 0
points['interactions'] = 0
points['to_end_seconds'] = points.to_end.apply(lambda x: x.seconds)


previous_i = 0
om = points.iloc[previous_i].overpoints
for i, row in points.iterrows():
    if row.difference > td(0):
        points.loc[previous_i, 'overpoints_mean'] = om
        om = row.overpoints
        previous_i = i
    else:
        om += row.overpoints
        om /= 2

# reduced = points.loc[(points.overpoints_mean > 0) & (points.to_video_end > td(0))]
reduced = points.loc[points.overpoints_mean > 0]

session_id = 0
session_length = 1
for i, row in reduced.iterrows():
    if row.difference > td(5, 's'):
        session_id += 1
        session_length = 1
    points.loc[i, 'session_id'] = session_id
    points.loc[i, 'session_length'] = session_length
    session_length += 1

# reduced = points.loc[(points.overpoints_mean > 0) & (points.to_video_end > td(0))]
reduced = points.loc[points.overpoints_mean > 0]

reduced = reduced.groupby('session_id').filter(lambda x: len(x) > 5)

sessions = reduced.groupby('session_id')

summary = sessions.aggregate({'overpoints': np.mean,
                              'session_length': np.max,
                              'difference_seconds': lambda x: np.sum(x) - x.iloc[0],
                              'to_end_seconds': np.min,
                              'interactions': np.mean})

interactions = [[(0, 97), 1],
                [(113, 115), 1],
                [(118, 137), 2],
                [(143, 191), 1],
                [(193, 209), 1],
                [(212, 216), 1],
                [(225, 252), 3],
                [(260, 260), 1],
                [(281, 281), 1],
                [(284, 293), 2],
                [(311, 338), 3],
                [(347, 393), 2],
                [(397, 411), 1],
                [(414, 483), 2],
                [(485, 497), 4],
                [(500, 500), 2],
                [(503, 505), 1],
                [(507, 522), 1],
                [(531, 614), 2],
                [(624, 643), 1],
                [(646, 681), 2],
                [(689, 700), 1],
                [(747, 787), 1],
                [(845, 869), 1],
                [(878, 903), 2],
                [(906, 930), 1],
                [(931, 1062), 1],
                [(1078, 1153), 1],
                [(1164, 1372), 2],
                [(1381, 1508), 1],
                [(1512, 1517), 1],
                [(1527, 1678), 2],
                [(1681, 1697), 1],
                [(1702, 1753), 1],
                [(1760, 1760), 1],
                [(1764, 1764), 2],
                [(1772, 1948), 4],
                [(1959, 1959), 2],
                [(1969, 1969), 1],
                [(1973, 1973), 1],
                [(1983, 2025), 3],
                [(2036, 2046), 2],
                [(2057, 2057), 1],
                [(2063, 2063), 2],
                [(2066, 3003), 4],
                [(3005, 3005), 3],
                [(3009, 3009), 2],
                [(3014, 3017), 1],
                [(3020, 3035), 2],
                [(3038, 3040), 1],
                [(3050, 3074), 1],
                [(3120, 3120), 1],
                [(3122, 3483), 2],
                [(3491, 3687), 1],
                [(3691, 3704), 1],
                [(3706, 4144), 2],
                [(4154, 4708), 1],
                [(4709, 5093), 1],
                [(5095, 5206), 2],
                [(5212, 5212), 3],
                [(5216, 5353), 4],
                [(5369, 5646), 1],
                [(5745, 5761), 1],
                [(5762, 5802), 3],
                [(5803, 5960), 1],
                [(5962, 6197), 3],
                [(6207, 6216), 1],
                [(6222, 6266), 2],
                [(6269, 6269), 1],
                [(6270, 6307), 2],
                [(6327, 6366), 1],
                [(6370, 6607), 3],
                [(6631, 6702), 1],
                [(6789, 6970), 1],
                [(41579, 41580), 1],
                [(41581, 41716), 2],
                [(41489, 41577), 1],
                [(40640, 41479), 2],
                [(35382, 40639), 2]]

for i in interactions:
    low, high = i[0]
    inter = i[1]
    points.loc[low:high+1, 'interactions'] = inter

points['binary_interactions'] = 0
points.loc[points.interactions == 1, 'binary_interactions'] = 1
points.loc[points.interactions > 1, 'binary_interactions'] = 2

data1 = points[points.interactions == 1]
data2 = points[points.interactions == 2]
data3 = points[points.interactions == 3]
data4 = points[points.interactions == 4]
data = [data1.overpoints, data2.overpoints, data3.overpoints, data4.overpoints]
interactions_lengths = sum([len(x) for x in data])
data_lengths = [len(x)/interactions_lengths for x in data]

for d in data:
    print(d.describe())

plt.figure()
plt.boxplot(data, widths=data_lengths)
plt.show()

d2 = points[points.binary_interactions == 2]
d2_lengths = [len(x)/interactions_lengths for x in [data1, d2]]

plt.boxplot([data1.overpoints, d2.overpoints], widths=d2_lengths)
plt.show()

log_reg = LogisticRegression(solver='sag', max_iter=100, multi_class='multinomial')
log_reg1 = LogisticRegression(solver='sag', max_iter=100, multi_class='multinomial')
log_reg_bin = LogisticRegression()
log_reg_bin1 = LogisticRegression()
X = points.loc[points.interactions > 0, ['overpoints']]
X1 = points.loc[points.interactions > 0, ['overpoints', 'to_end_seconds']]
y = points.loc[points.interactions > 0, 'interactions']
y_bin = points.loc[points.interactions > 0, 'binary_interactions']
log_reg.fit(X, y)
print(log_reg.score(X, y))
print(log_reg.coef_)
log_reg1.fit(X1, y)
print(log_reg1.score(X1, y))
print(log_reg1.coef_)
log_reg_bin.fit(X, y_bin)
print(log_reg_bin.score(X, y_bin))
print(log_reg_bin.coef_)
log_reg_bin1.fit(X1, y_bin)
print(log_reg_bin1.score(X1, y_bin))
print(log_reg_bin1.coef_)

ord_log_reg = mord.LogisticIT()
ord_log_reg1 = mord.LogisticIT()
ord_log_reg.fit(X, y)
print(ord_log_reg.score(X, y))
print(ord_log_reg.coef_)
ord_log_reg1.fit(X1, y)
print(ord_log_reg1.score(X1, y))
print(ord_log_reg1.coef_)


Xp = points.loc[:, ['overpoints']]
Xp1 = points.loc[:, ['overpoints', 'to_end_seconds']]
y_ord = ord_log_reg.predict(Xp)
y_nom = log_reg.predict(Xp)
y_ord1 = ord_log_reg1.predict(Xp1)
y_nom1 = log_reg1.predict(Xp1)
y_binp = log_reg_bin.predict(Xp)
y_binp1 = log_reg_bin1.predict(Xp1)

points['predicted_interactions_ord'] = y_ord
points['predicted_interactions_nom'] = y_nom
points['predicted_interactions_ord1'] = y_ord1
points['predicted_interactions_nom1'] = y_nom1
points['predicted_interactions_bin'] = y_binp
points['predicted_interactions_bin1'] = y_binp1

data1o = points[points.predicted_interactions_ord == 1]
data2o = points[points.predicted_interactions_ord == 2]
data3o = points[points.predicted_interactions_ord == 3]
data4o = points[points.predicted_interactions_ord == 4]
datao = [data1o.overpoints, data2o.overpoints, data3o.overpoints, data4o.overpoints]

data1n = points[points.predicted_interactions_nom == 1]
data2n = points[points.predicted_interactions_nom == 2]
data3n = points[points.predicted_interactions_nom == 3]
data4n = points[points.predicted_interactions_nom == 4]
datan = [data1n.overpoints, data2n.overpoints, data3n.overpoints, data4n.overpoints]

data1o1 = points[points.predicted_interactions_ord1 == 1]
data2o1 = points[points.predicted_interactions_ord1 == 2]
data3o1 = points[points.predicted_interactions_ord1 == 3]
data4o1 = points[points.predicted_interactions_ord1 == 4]
datao1 = [data1o1.overpoints, data2o1.overpoints, data3o1.overpoints, data4o1.overpoints]

data1n1 = points[points.predicted_interactions_nom1 == 1]
data2n1 = points[points.predicted_interactions_nom1 == 2]
data3n1 = points[points.predicted_interactions_nom1 == 3]
data4n1 = points[points.predicted_interactions_nom1 == 4]
datan1 = [data1n1.overpoints, data2n1.overpoints, data3n1.overpoints, data4n1.overpoints]

data1b = points[points.predicted_interactions_bin == 1]
data2b = points[points.predicted_interactions_bin == 2]
datab = [data1b.overpoints, data2b.overpoints]

data1b1 = points[points.predicted_interactions_bin1 == 1]
data2b1 = points[points.predicted_interactions_bin1 == 2]
datab1 = [data1b1.overpoints, data2b1.overpoints]

plt.boxplot(datao, widths=[len(x)/len(points) for x in datao])
plt.figure()
plt.boxplot(datan, widths=[len(x)/len(points) for x in datan])
plt.figure()
plt.boxplot(datao1, widths=[len(x)/len(points) for x in datao1])
plt.figure()
plt.boxplot(datan1, widths=[len(x)/len(points) for x in datan1])
plt.figure()
plt.boxplot(datab, widths=[len(x)/len(points) for x in datab][:2])
plt.figure()
plt.boxplot(datab1, widths=[len(x)/len(points) for x in datab1][:2])
plt.show()

Xlin = summary.loc[summary.interactions > 0, ['overpoints', 'session_length',
                                           'difference_seconds', 'to_end_seconds']]
ylin = summary.loc[summary.interactions > 0, 'interactions']
lin_reg = LinearRegression()
lin_reg.fit(Xlin, ylin)
print(lin_reg.score(Xlin, ylin))
print(lin_reg.coef_)

plt.scatter(ylin, Xlin['overpoints'])
plt.show()

Xlinp = summary.loc[:, ['overpoints', 'session_length', 'difference_seconds', 'to_end_seconds']]
ylinp = lin_reg.predict(Xlinp)
plt.scatter(ylinp, Xlinp['overpoints'])
plt.show()
