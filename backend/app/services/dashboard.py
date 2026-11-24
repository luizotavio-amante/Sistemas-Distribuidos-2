from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.repositories.dashboard import DashboardRepository
from app.schemas.dashboard import DashboardResponse


class DashboardService:
    def __init__(self, db: Session):
        self.repository = DashboardRepository(db)

    def get_summary(self) -> DashboardResponse:
        timezone = ZoneInfo("America/Sao_Paulo")

        now = datetime.now(timezone)

        start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        end = start + timedelta(days=1)

        return DashboardResponse(
            total_products=self.repository.count_products(),
            total_stock=self.repository.total_stock(),
            low_stock_products=self.repository.count_low_stock_products(),
            total_sales=self.repository.count_sales(),
            total_revenue=self.repository.total_revenue(),
            daily_revenue=self.repository.daily_revenue(start, end),
        )
