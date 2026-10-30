# Mini Studio Design Coach 평가 프로그램

def calculate_metrics(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall) > 0
        else 0
    )
    accuracy = (tp + tn) / len(y_true)

    return {
        "TP": tp,
        "FP": fp,
        "TN": tn,
        "FN": fn,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1": f1,
    }


test_data = {
    "정렬": {
        "true": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        "pred": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    },
    "간격": {
        "true": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        "pred": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    },
    "색상 대비": {
        "true": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        "pred": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    },
    "타이포그래피": {
        "true": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        "pred": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    },
}


print("=" * 65)
print("Mini Studio Design Coach 평가 결과")
print("=" * 65)

for category, data in test_data.items():
    result = calculate_metrics(data["true"], data["pred"])

    print(f"\n[{category}]")
    print(
        f"TP={result['TP']}  "
        f"FP={result['FP']}  "
        f"TN={result['TN']}  "
        f"FN={result['FN']}"
    )

    print(
        f"Accuracy : {result['Accuracy']:.3f}\n"
        f"Precision: {result['Precision']:.3f}\n"
        f"Recall   : {result['Recall']:.3f}\n"
        f"F1 Score : {result['F1']:.3f}"
    )