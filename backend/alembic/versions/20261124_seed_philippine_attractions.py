"""seed_philippine_attractions

Revision ID: 20261124_seed_ph_attractions
Revises: 69f7ce56810f
Create Date: 2026-11-24

"""
from datetime import datetime
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.seeds.philippine_attractions import PHILIPPINE_ATTRACTIONS


# revision identifiers, used by Alembic.
revision: str = "20261124_seed_ph_attractions"
down_revision: Union[str, None] = "69f7ce56810f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    now = datetime.utcnow()

    # 1. Ensure all unique type categories exist in `types`
    unique_types = sorted({t for item in PHILIPPINE_ATTRACTIONS for t in item["types"]})
    type_id_by_name = {}

    for type_name in unique_types:
        row = conn.execute(
            sa.text("SELECT categoryid FROM types WHERE category = :cat LIMIT 1"),
            {"cat": type_name},
        ).fetchone()
        if row:
            type_id_by_name[type_name] = row[0]
        else:
            res = conn.execute(
                sa.text("INSERT INTO types (category) VALUES (:cat) RETURNING categoryid"),
                {"cat": type_name},
            )
            type_id_by_name[type_name] = res.scalar_one()

    # 2. Insert each place and its placetypes junction rows idempotently
    for item in PHILIPPINE_ATTRACTIONS:
        gpid = item["googleplaceid"]
        existing = conn.execute(
            sa.text("SELECT placeid FROM places WHERE googleplaceid = :gpid LIMIT 1"),
            {"gpid": gpid},
        ).fetchone()

        if existing:
            place_id = existing[0]
        else:
            res = conn.execute(
                sa.text(
                    """
                    INSERT INTO places (
                        googleplaceid, destination, address, city,
                        latitude, longitude, rating, userratingtotal,
                        pricelevel, openinghours, is_open_now,
                        website, phonenumber, photos,
                        datefetched, lastupdate, isactive
                    ) VALUES (
                        :googleplaceid, :destination, :address, :city,
                        :latitude, :longitude, :rating, :userratingtotal,
                        :pricelevel, :openinghours, :is_open_now,
                        :website, :phonenumber, :photos,
                        :datefetched, :lastupdate, :isactive
                    )
                    RETURNING placeid
                    """
                ),
                {
                    "googleplaceid": gpid,
                    "destination": item["destination"],
                    "address": item["address"],
                    "city": item["city"],
                    "latitude": item["latitude"],
                    "longitude": item["longitude"],
                    "rating": item["rating"],
                    "userratingtotal": item["userratingtotal"],
                    "pricelevel": item["pricelevel"],
                    "openinghours": item["openinghours"],
                    "is_open_now": item["is_open_now"],
                    "website": item["website"],
                    "phonenumber": item["phonenumber"],
                    "photos": item["photos"],
                    "datefetched": now,
                    "lastupdate": now,
                    "isactive": True,
                },
            )
            place_id = res.scalar_one()

        for type_name in item["types"]:
            cat_id = type_id_by_name[type_name]
            link_exists = conn.execute(
                sa.text(
                    "SELECT 1 FROM placetypes WHERE placeid = :pid AND categoryid = :cid LIMIT 1"
                ),
                {"pid": place_id, "cid": cat_id},
            ).fetchone()
            if not link_exists:
                conn.execute(
                    sa.text(
                        "INSERT INTO placetypes (placeid, categoryid) VALUES (:pid, :cid)"
                    ),
                    {"pid": place_id, "cid": cat_id},
                )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            DELETE FROM placetypes
            WHERE placeid IN (
                SELECT placeid FROM places WHERE googleplaceid LIKE 'ph_seed_%'
            )
            """
        )
    )
    conn.execute(
        sa.text("DELETE FROM places WHERE googleplaceid LIKE 'ph_seed_%'")
    )
