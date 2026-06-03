from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://mulenet:mulenet@localhost:5432/mulenet"
    model_dir: str = "/tmp/mulenet-models"
    cors_origin: str = "http://localhost:3000"
    organization_dataset_path: str = "DataSet.csv"


settings = Settings()
