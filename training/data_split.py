from sklearn.model_selection import train_test_split

from training.data_preprocessing import (
    load_and_clean_data,
    create_preprocessor
)


def prepare_data():
    # Load cleaned features and target
    X, y = load_and_clean_data()

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    # Create preprocessor
    preprocessor = create_preprocessor()

    # Fit only on training data
    X_train_processed = preprocessor.fit_transform(X_train)

    # Transform test data
    X_test_processed = preprocessor.transform(X_test)

    print("Training data shape:", X_train_processed.shape)
    print("Testing data shape:", X_test_processed.shape)

    return (
        X_train_processed,
        X_test_processed,
        y_train,
        y_test
    )


if __name__ == "__main__":
    prepare_data()