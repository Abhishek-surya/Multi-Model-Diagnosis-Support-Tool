from sklearn.model_selection import train_test_split
from training.data_preprocessing import load_and_clean_data


def split_data(X=None, y=None, test_size=0.2, random_state=42):
    if X is None or y is None:
        X, y = load_and_clean_data()

    # 80/20 stratified split: 242 train samples, 61 test samples
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    return X_train, X_test, y_train, y_test


def prepare_data():
    return split_data()


if __name__ == "__main__":
    X_train, X_test, y_train, y_test = prepare_data()
    print(f"Training samples: {len(X_train)} | Testing samples: {len(X_test)}")
    print(f"Target distribution in train:\n{y_train.value_counts()}")
    print(f"Target distribution in test:\n{y_test.value_counts()}")