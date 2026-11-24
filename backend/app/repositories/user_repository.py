from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, payload: UserCreate, hashed_password: str) -> User:
        # Create new user with fields from payload and hashed password
        user = User(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            hashed_password=hashed_password,
        )
        # Add to session and commit
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> User | None:
        # Query user by user_id primary key
        result = await self.db.execute(select(User).where(User.user_id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def update(self, user: User, payload: UserUpdate) -> User:
        user.first_name = payload.first_name
        user.last_name = payload.last_name
        user.email = payload.email
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def hard_delete(self, user: User) -> None:
        from sqlalchemy import delete
        from app.models.userPreference import UserPreference
        from app.models.trip import Trip
        from app.models.itinerary import Itinerary
        from app.models.itineraryDays import ItineraryDays
        from app.models.itineraryActivity import ItineraryActivity
        from app.models.tripBreaks import TripBreaks

        # 1. Delete user preferences
        await self.db.execute(delete(UserPreference).where(UserPreference.user_id == user.user_id))

        # 2. Find trips for this user
        result = await self.db.execute(select(Trip.tripid).where(Trip.userid == user.user_id))
        trip_ids = result.scalars().all()

        if trip_ids:
            # 3. Find itineraries for these trips
            result = await self.db.execute(select(Itinerary.itineraryid).where(Itinerary.tripid.in_(trip_ids)))
            itinerary_ids = result.scalars().all()

            if itinerary_ids:
                # 4. Find itinerary days for these itineraries
                result = await self.db.execute(select(ItineraryDays.dayid).where(ItineraryDays.itineraryid.in_(itinerary_ids)))
                day_ids = result.scalars().all()

                if day_ids:
                    # 5. Delete itinerary activities
                    await self.db.execute(delete(ItineraryActivity).where(ItineraryActivity.dayid.in_(day_ids)))
                
                # 6. Delete itinerary days
                await self.db.execute(delete(ItineraryDays).where(ItineraryDays.itineraryid.in_(itinerary_ids)))
            
            # 7. Delete itineraries
            await self.db.execute(delete(Itinerary).where(Itinerary.tripid.in_(trip_ids)))
            
            # 8. Delete trip breaks
            await self.db.execute(delete(TripBreaks).where(TripBreaks.tripid.in_(trip_ids)))
            
            # 9. Delete trips
            await self.db.execute(delete(Trip).where(Trip.userid == user.user_id))

        # 10. Delete the user
        await self.db.delete(user)
        await self.db.commit()

