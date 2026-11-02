"""Python 3, standard library only. Place beside practice-iris.csv and run this file.
Teaching baseline, not a benchmark or production classifier.
"""
import csv, json, math
from pathlib import Path

rows = list(csv.DictReader((Path(__file__).parent / 'practice-iris.csv').open(encoding='utf-8')))
features = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']
labels = sorted({r['species'] for r in rows})
train, test, counts = [], [], {}
for row in rows:
    label = row['species']
    index = counts.get(label, 0)
    counts[label] = index + 1
    (test if index % 5 == 0 else train).append(([float(row[k]) for k in features], label))
mean = [sum(x[j] for x, _ in train) / len(train) for j in range(4)]
scale = [math.sqrt(sum((x[j]-mean[j])**2 for x, _ in train)/len(train)) or 1 for j in range(4)]
def normalize(x):
    return [(x[j]-mean[j])/scale[j] for j in range(4)]
centers = []
for label in labels:
    group = [normalize(x) for x, y in train if y == label]
    centers.append([sum(x[j] for x in group)/len(group) for j in range(4)])
matrix = [[0]*len(labels) for _ in labels]
for x, label in test:
    z = normalize(x)
    prediction = min(range(len(labels)), key=lambda k: sum((z[j]-centers[k][j])**2 for j in range(4)))
    matrix[labels.index(label)][prediction] += 1
correct = sum(matrix[i][i] for i in range(len(labels)))
result = {'rows':len(rows), 'train':len(train), 'test':len(test), 'labels':labels,
          'correct':correct, 'accuracy':correct/len(test), 'confusionMatrix':matrix}
print(json.dumps(result, indent=2))
