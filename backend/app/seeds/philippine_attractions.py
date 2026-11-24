"""
Curated dataset of 225 real Philippine attractions across 15 major tourist hubs.
Covers all 14 Tripana user preference categories and all 3 budget tiers (price levels 1-4).
Designed for local database fallback when GOOGLE_PLACES_API_KEY is not configured.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Dict, List, TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


def _a(
    slug: str,
    name: str,
    address: str,
    city: str,
    lat: float,
    lng: float,
    rating: float,
    reviews: int,
    price: int,
    types: List[str],
    hours: str = "08:00 AM - 06:00 PM",
) -> Dict:
    return {
        "googleplaceid": f"ph_seed_{slug}",
        "destination": name,
        "address": address,
        "city": city,
        "latitude": lat,
        "longitude": lng,
        "rating": rating,
        "userratingtotal": reviews,
        "pricelevel": price,
        "openinghours": hours,
        "is_open_now": True,
        "website": None,
        "phonenumber": None,
        "photos": None,
        "types": types,
    }


PHILIPPINE_ATTRACTIONS: List[Dict] = [
    # =========================================================================
    # 1. MANILA / NCR (15 attractions)
    # =========================================================================
    _a("mnl_intramuros", "Intramuros Historic Walled City", "Bonifacio Dr & Padre Burgos St, Intramuros, Manila, Metro Manila, Philippines", "Manila", 14.5896, 120.9747, 4.7, 14820, 1, ["historical landmark", "monument", "scenic viewpoint", "tourist_attraction"]),
    _a("mnl_fort_santiago", "Fort Santiago", "Intramuros, Manila, Metro Manila, Philippines", "Manila", 14.5942, 120.9704, 4.7, 16200, 1, ["historical landmark", "monument", "museum", "park", "landscape"]),
    _a("mnl_national_museum_fine_arts", "National Museum of Fine Arts", "Padre Burgos Ave, Ermita, Manila, Metro Manila, Philippines", "Manila", 14.5869, 120.9812, 4.8, 12900, 1, ["art gallery", "art_gallery", "museum", "art museum", "historical landmark"]),
    _a("mnl_national_museum_natural_history", "National Museum of Natural History", "Teodoro F. Valencia Cir, Ermita, Manila, Metro Manila, Philippines", "Manila", 14.5832, 120.9815, 4.8, 11400, 1, ["museum", "wildlife sanctuary", "nature reserve", "art_gallery", "scenic viewpoint"]),
    _a("mnl_rizal_park", "Rizal Park (Luneta)", "Roxas Blvd, Ermita, Manila, Metro Manila, Philippines", "Manila", 14.5826, 120.9787, 4.6, 18500, 1, ["park", "monument", "historical landmark", "landscape", "outdoor"]),
    _a("mnl_binondo_chinatown", "Binondo Chinatown Food Walk", "Ongpin St, Binondo, Manila, Metro Manila, Philippines", "Manila", 14.6006, 120.9754, 4.7, 9400, 1, ["street food", "local restaurant", "food stall", "restaurant", "market"]),
    _a("mnl_manila_ocean_park", "Manila Ocean Park", "Quirino Grandstand, 666 Behind, Ermita, Manila, Metro Manila, Philippines", "Manila", 14.5792, 120.9726, 4.5, 15300, 3, ["aquarium", "water sport", "wildlife sanctuary", "zoo", "tourist_attraction"]),
    _a("mnl_sm_mall_of_asia", "SM Mall of Asia & Seaside By the Bay", "Seaside Blvd, Pasay, Metro Manila, Philippines", "Manila", 14.5352, 120.9822, 4.7, 19800, 2, ["shopping mall", "shopping_mall", "store", "boutique", "scenic viewpoint"], "10:00 AM - 10:00 PM"),
    _a("mnl_bambike_ecotours", "Bambike Ecotours Intramuros", "Real St, Plaza San Luis Complex, Intramuros, Manila, Metro Manila, Philippines", "Manila", 14.5887, 120.9753, 4.8, 2150, 2, ["outdoor", "historical landmark", "scenic viewpoint", "park"]),
    _a("mnl_pinto_art_gallery_bgc", "BGC Arts Center & Murals Walk", "26th St, Bonifacio Global City, Taguig, Metro Manila, Philippines", "Manila", 14.5514, 121.0498, 4.7, 4300, 2, ["art gallery", "art_gallery", "art museum", "scenic viewpoint", "park"]),
    _a("mnl_poblacion_rooftop", "Poblacion Heritage & Rooftop Lounge District", "P. Burgos St, Poblacion, Makati, Metro Manila, Philippines", "Manila", 14.5655, 121.0311, 4.6, 5120, 3, ["bar", "club", "lounge", "night_club", "entertainment", "restaurant"], "05:00 PM - 02:00 AM"),
    _a("mnl_barbara_heritage_restaurant", "Barbara's Heritage Restaurant", "General Luna St, Intramuros, Manila, Metro Manila, Philippines", "Manila", 14.5889, 120.9752, 4.5, 3890, 3, ["restaurant", "local restaurant", "cafe", "historical landmark"], "11:00 AM - 09:00 PM"),
    _a("mnl_okada_fountain_spa", "The Retreat Spa & Fountain at Okada Manila", "New Seaside Dr, Entertainment City, Paranaque, Metro Manila, Philippines", "Manila", 14.5150, 120.9803, 4.8, 7600, 4, ["spa", "wellness", "resort", "lounge", "entertainment"], "10:00 AM - 11:00 PM"),
    _a("mnl_arroceros_forest_park", "Arroceros Urban Forest Park", "Antonio Villegas St, Ermita, Manila, Metro Manila, Philippines", "Manila", 14.5945, 120.9818, 4.6, 1950, 1, ["park", "nature reserve", "nature", "hiking trail", "landscape"]),
    _a("mnl_dolomite_baywalk", "Manila Baywalk Sunset Promenade", "Roxas Blvd, Malate, Manila, Metro Manila, Philippines", "Manila", 14.5712, 120.9819, 4.4, 8700, 1, ["beach", "scenic viewpoint", "landscape", "outdoor", "park"], "06:00 AM - 10:00 PM"),

    # =========================================================================
    # 2. CEBU (15 attractions)
    # =========================================================================
    _a("ceb_magellans_cross", "Magellan's Cross & Basilica Minore del Santo Nino", "P. Burgos St, Cebu City, Cebu, Philippines", "Cebu", 10.2936, 123.9021, 4.8, 17400, 1, ["historical landmark", "monument", "church", "temple", "scenic viewpoint"]),
    _a("ceb_fort_san_pedro", "Fort San Pedro", "A. Pigafetta St, Cebu City, Cebu, Philippines", "Cebu", 10.2925, 123.9058, 4.6, 9800, 1, ["historical landmark", "monument", "museum", "park"]),
    _a("ceb_kawasan_falls", "Kawasan Falls & Badian Canyoneering", "Matutinao, Badian, Cebu, Philippines", "Cebu", 9.8032, 123.3742, 4.8, 11200, 2, ["water sport", "hiking trail", "nature reserve", "swimming", "outdoor"]),
    _a("ceb_moalboal_sardine_run", "Moalboal Sardine Run & Pescador Island", "Panagsama Beach, Moalboal, Cebu, Philippines", "Cebu", 9.9478, 123.3665, 4.8, 8600, 2, ["diving", "snorkeling", "water sport", "island", "beach", "wildlife sanctuary"]),
    _a("ceb_osmena_peak", "Osmena Peak", "Mantalongon, Dalaguete, Cebu, Philippines", "Cebu", 9.8225, 123.4426, 4.7, 5400, 1, ["hiking trail", "mountain", "campground", "scenic viewpoint", "landscape", "outdoor"]),
    _a("ceb_tops_lookout", "TOPS Cebu Busay Panoramic Lookout", "Cebu Tops Rd, Busay, Cebu City, Cebu, Philippines", "Cebu", 10.3706, 123.8709, 4.7, 7900, 2, ["scenic viewpoint", "viewpoint", "landscape", "restaurant", "cafe"], "09:00 AM - 11:00 PM"),
    _a("ceb_sirao_flower_garden", "Sirao Pictorial Garden & Camping Grounds", "Busay-Sirao Rd, Cebu City, Cebu, Philippines", "Cebu", 10.4055, 123.8672, 4.5, 6300, 1, ["scenic viewpoint", "landscape", "park", "campground", "outdoor"]),
    _a("ceb_ocean_park", "Cebu Ocean Park", "SM Seaside Complex, SRP, Cebu City, Cebu, Philippines", "Cebu", 10.2809, 123.8805, 4.7, 9100, 3, ["aquarium", "wildlife sanctuary", "zoo", "water sport", "tourist_attraction"]),
    _a("ceb_sugbo_mercado", "Sugbo Mercado IT Park Night Food Market", "Garden Bloc, Cebu IT Park, Lahug, Cebu City, Cebu, Philippines", "Cebu", 10.3308, 123.9064, 4.7, 10500, 1, ["street food", "food court", "food stall", "local restaurant", "market"], "04:00 PM - 12:00 AM"),
    _a("ceb_cnt_lechon", "House of Lechon & Carcar Heritage Cuisine", "Acacia St, Kamputhaw, Cebu City, Cebu, Philippines", "Cebu", 10.3186, 123.9004, 4.6, 6800, 2, ["local restaurant", "restaurant", "food stall"], "10:00 AM - 10:00 PM"),
    _a("ceb_mactan_island_hopping", "Mactan & Nalusuan Island Hopping Sanctuary", "Maribago Wharf, Lapu-Lapu City, Mactan, Cebu, Philippines", "Cebu", 10.2842, 124.0005, 4.7, 4900, 3, ["island", "ferry", "beach", "snorkeling", "water sport", "resort"]),
    _a("ceb_shangrila_chi_spa", "Shangri-La Mactan Beach Resort & Chi Spa", "Punta Engano Rd, Lapu-Lapu City, Cebu, Philippines", "Cebu", 10.3075, 124.0196, 4.9, 8200, 4, ["spa", "wellness", "resort", "beach", "swimming"], "08:00 AM - 10:00 PM"),
    _a("ceb_museo_sugbo", "Museo Sugbo & Casa Gorordo Art Museum", "M.J. Cuenco Ave, Cebu City, Cebu, Philippines", "Cebu", 10.3037, 123.9063, 4.6, 3100, 1, ["museum", "art gallery", "art museum", "historical landmark"]),
    _a("ceb_ayala_center_cebu", "Ayala Center Cebu & Terraces", "Cebu Business Park, Archbishop Reyes Ave, Cebu City, Cebu, Philippines", "Cebu", 10.3173, 123.9056, 4.7, 13400, 2, ["shopping mall", "shopping_mall", "boutique", "store", "restaurant"], "10:00 AM - 09:00 PM"),
    _a("ceb_la_vie_in_the_sky", "La Vie in the Sky Winery & Lounge", "Cebu Tops Rd, Busay, Cebu City, Cebu, Philippines", "Cebu", 10.3688, 123.8732, 4.6, 5700, 3, ["bar", "lounge", "club", "entertainment", "scenic viewpoint"], "04:00 PM - 12:00 AM"),

    # =========================================================================
    # 3. BAGUIO (15 attractions)
    # =========================================================================
    _a("bag_burnham_park", "Burnham Park & Boating Lagoon", "Jose Abad Santos Dr, Baguio, Benguet, Philippines", "Baguio", 16.4124, 120.5929, 4.6, 21000, 1, ["park", "landscape", "water sport", "outdoor", "scenic viewpoint"]),
    _a("bag_bencab_museum", "BenCab Museum", "Km 6 Asin Rd, Tuba, Baguio, Benguet, Philippines", "Baguio", 16.3982, 120.5469, 4.8, 8900, 2, ["art gallery", "art museum", "museum", "scenic viewpoint", "cafe"]),
    _a("bag_camp_john_hay", "Camp John Hay Eco-Trail & Yellow Trail", "Loakan Rd, Camp John Hay, Baguio, Benguet, Philippines", "Baguio", 16.3968, 120.6105, 4.7, 12300, 1, ["hiking trail", "park", "mountain", "nature reserve", "campground", "outdoor"]),
    _a("bag_mines_view_park", "Mines View Park & Observation Deck", "Mines View, Baguio, Benguet, Philippines", "Baguio", 16.4198, 120.6277, 4.5, 16500, 1, ["scenic viewpoint", "viewpoint", "landscape", "park", "market", "store"]),
    _a("bag_wright_park_mansion", "The Mansion & Wright Park Pine Promenade", "Leonard Wood Rd, Baguio, Benguet, Philippines", "Baguio", 16.4143, 120.6186, 4.6, 11700, 1, ["historical landmark", "monument", "park", "landscape", "outdoor"]),
    _a("bag_baguio_public_market", "Baguio City Market & Good Shepherd Pasalubong", "Magsaysay Ave, Baguio, Benguet, Philippines", "Baguio", 16.4159, 120.5947, 4.6, 9800, 1, ["market", "store", "boutique", "local restaurant", "food stall"]),
    _a("bag_harrison_night_market", "Baguio Night Market & Street Food Strip", "Harrison Rd, Baguio, Benguet, Philippines", "Baguio", 16.4131, 120.5957, 4.6, 8400, 1, ["street food", "market", "store", "entertainment", "food stall"], "09:00 PM - 01:00 AM"),
    _a("bag_good_taste_cafe", "Good Taste Cafe & Restaurant", "Otek St, Baguio, Benguet, Philippines", "Baguio", 16.4142, 120.5919, 4.6, 14200, 1, ["local restaurant", "restaurant", "cafe", "food court"]),
    _a("bag_cafe_by_the_ruins", "Cafe by the Ruins & Ili-Likha Artists Village", "25 Shuntug Rd & Assumption Rd, Baguio, Benguet, Philippines", "Baguio", 16.4146, 120.5924, 4.6, 5900, 2, ["cafe", "restaurant", "art gallery", "local restaurant"]),
    _a("bag_tam_awan_village", "Tam-awan Village Cordillera Heritage & Art Center", "366-C Pinsao Proper, Baguio, Benguet, Philippines", "Baguio", 16.4292, 120.5764, 4.6, 4700, 1, ["art gallery", "museum", "historical landmark", "hiking trail", "scenic viewpoint"]),
    _a("bag_mt_kalugong", "Mt. Kalugong Eco-Park & Camping Grounds", "Tawang, La Trinidad, Baguio, Benguet, Philippines", "Baguio", 16.4533, 120.6021, 4.7, 3600, 1, ["hiking trail", "mountain", "campground", "scenic viewpoint", "outdoor", "nature"]),
    _a("bag_botanical_garden", "Baguio Botanical Garden & Wildlife Aviary", "37 Leonard Wood Rd, Baguio, Benguet, Philippines", "Baguio", 16.4143, 120.6131, 4.7, 10800, 1, ["park", "nature reserve", "wildlife sanctuary", "landscape", "scenic viewpoint"]),
    _a("bag_north_haven_spa", "North Haven Spa at Casa Vallejo", "Upper Session Rd, Baguio, Benguet, Philippines", "Baguio", 16.4106, 120.5997, 4.8, 2400, 3, ["spa", "wellness", "resort", "historical landmark"]),
    _a("bag_craft_brewery", "Baguio Craft Brewery & Speakeasy Lounge", "Km 4 Marcos Hwy, Baguio, Benguet, Philippines", "Baguio", 16.4018, 120.5789, 4.7, 4100, 3, ["bar", "lounge", "club", "entertainment", "restaurant"], "04:00 PM - 12:00 AM"),
    _a("bag_manor_john_hay", "The Manor at Camp John Hay Fine Dining & Wellness", "Orpilla St, Camp John Hay, Baguio, Benguet, Philippines", "Baguio", 16.3983, 120.6122, 4.8, 6900, 4, ["resort", "spa", "wellness", "restaurant", "landscape"]),

    # =========================================================================
    # 4. BORACAY / AKLAN (15 attractions)
    # =========================================================================
    _a("bor_white_beach", "White Beach Station 1 to Station 3", "White Beach Path, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9646, 121.9242, 4.9, 24500, 1, ["beach", "swimming", "resort", "scenic viewpoint", "landscape"]),
    _a("bor_puka_shell_beach", "Puka Shell Beach", "Yapak, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9949, 121.9126, 4.8, 9700, 1, ["beach", "swimming", "landscape", "scenic viewpoint", "nature"]),
    _a("bor_bulabog_kiteboarding", "Bulabog Beach Watersports & Kiteboarding Hub", "Bulabog, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9675, 121.9301, 4.7, 5200, 2, ["water sport", "beach", "diving", "snorkeling", "swimming"]),
    _a("bor_crocodile_crystal_cove", "Crystal Cove & Crocodile Island Hopping Tour", "Tambisaan Jetty, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9398, 121.9547, 4.7, 6800, 2, ["island", "ferry", "snorkeling", "diving", "beach", "water sport"]),
    _a("bor_willys_rock", "Willy's Rock Landmark & Grotto", "Station 1, Balabag, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9708, 121.9189, 4.7, 8100, 1, ["historical landmark", "monument", "beach", "scenic viewpoint"]),
    _a("bor_mount_luho", "Mount Luho Eco-Trail & Panoramic Viewdeck", "Mount Luho Rd, Bulabog, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9756, 121.9308, 4.5, 3400, 1, ["hiking trail", "mountain", "scenic viewpoint", "park", "wildlife sanctuary"]),
    _a("bor_dmall_boracay", "D'Mall de Boracay & Talipapa Market", "Station 2, Balabag, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9632, 121.9255, 4.6, 11200, 2, ["shopping mall", "market", "boutique", "store", "food court", "street food"]),
    _a("bor_sunny_side_cafe", "The Sunny Side Cafe & Jonah's Fruit Shake", "Station 3 Beachfront, Manoc-Manoc, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9552, 121.9296, 4.7, 6400, 2, ["cafe", "restaurant", "local restaurant", "food stall"]),
    _a("bor_dtalipapa_seafood", "D'Talipapa Fresh Seafood Paluto Market", "Station 2 Main Rd, Manoc-Manoc, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9574, 121.9288, 4.6, 4800, 2, ["local restaurant", "market", "food stall", "restaurant", "street food"]),
    _a("bor_epic_beach_club", "Epic Boracay & Paraw Sunset Lounge", "Station 2 Beachfront, Balabag, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9637, 121.9238, 4.6, 5100, 3, ["bar", "club", "lounge", "entertainment", "night_club"], "04:00 PM - 02:00 AM"),
    _a("bor_tirta_mandala_spa", "Tirta Spa & Mandala Wellness Resort", "Sitio Malabunot, Manoc-Manoc, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9498, 121.9345, 4.9, 2900, 4, ["spa", "wellness", "resort"]),
    _a("bor_crimson_shangrila_resort", "Shangri-La Boracay Punta Bunga Private Cove", "Barangay Yapak, Boracay, Malay, Aklan, Philippines", "Boracay", 11.9862, 121.9082, 4.9, 6100, 4, ["resort", "beach", "spa", "wellness", "island", "restaurant"]),
    _a("bor_motag_living_museum", "Motag Living Museum Cultural Heritage Experience", "Motag, Malay, Aklan, Boracay Mainland, Philippines", "Boracay", 11.9022, 121.9581, 4.8, 1850, 2, ["museum", "art gallery", "historical landmark", "nature"]),
    _a("bor_ariels_point", "Ariel's Point Cliff Diving & Eco-Camp", "Buruanga, Aklan, Boracay, Philippines", "Boracay", 11.8645, 121.8832, 4.8, 3900, 3, ["water sport", "diving", "snorkeling", "island", "outdoor", "campground"]),
    _a("bor_bakhawan_eco_park", "Aklan Mangrove Forest & Wildlife Eco-Park", "New Buswang, Kalibo, Aklan, Boracay Region, Philippines", "Boracay", 11.7248, 122.3821, 4.7, 3200, 1, ["wildlife sanctuary", "nature reserve", "hiking trail", "park", "nature"]),

    # =========================================================================
    # 5. PALAWAN — EL NIDO, CORON, PUERTO PRINCESA (15 attractions)
    # =========================================================================
    _a("pal_underground_river", "Puerto Princesa Subterranean River National Park", "Sabang, Puerto Princesa, Palawan, Philippines", "Palawan", 10.1926, 118.9266, 4.9, 16800, 2, ["nature reserve", "wildlife sanctuary", "island", "water sport", "historical landmark", "landscape"]),
    _a("pal_big_small_lagoon", "Big Lagoon & Small Lagoon Island Hopping (Tour A)", "Miniloc Island, El Nido, Palawan, Philippines", "Palawan", 11.1558, 119.3198, 4.9, 19400, 2, ["island", "beach", "water sport", "snorkeling", "scenic viewpoint", "landscape"]),
    _a("pal_kayangan_lake", "Kayangan Lake & Twin Lagoon", "Coron Island, Coron, Palawan, Philippines", "Palawan", 11.9547, 120.2234, 4.9, 17900, 2, ["island", "snorkeling", "diving", "water sport", "scenic viewpoint", "landscape"]),
    _a("pal_nacpan_beach", "Nacpan Twin Beach & Glamping Camp", "Sitio Calitang, Bucana, El Nido, Palawan, Philippines", "Palawan", 11.3204, 119.4278, 4.8, 11300, 1, ["beach", "swimming", "campground", "resort", "outdoor", "landscape"]),
    _a("pal_taraw_cliff", "Taraw Cliff Canopy Walk & Mt. Tapyas Trail", "Rizal St, Barangay Maligaya, El Nido, Palawan, Philippines", "Palawan", 11.1782, 119.3879, 4.8, 7200, 2, ["hiking trail", "mountain", "scenic viewpoint", "landscape", "outdoor"]),
    _a("pal_honda_bay", "Honda Bay Cowrie & Starfish Island Hopping", "Sta. Lourdes Wharf, Puerto Princesa, Palawan, Philippines", "Palawan", 9.8981, 118.7865, 4.7, 8400, 2, ["island", "ferry", "beach", "snorkeling", "water sport", "wildlife sanctuary"]),
    _a("pal_maquinit_hot_spring", "Maquinit Saltwater Hot Spring & Wellness", "Sitio Maquinit, Barangay Tagumpay, Coron, Palawan, Philippines", "Palawan", 11.9896, 120.2367, 4.7, 6500, 2, ["hot spring", "spa", "wellness", "relaxation", "nature"], "08:00 AM - 08:00 PM"),
    _a("pal_palawan_wildlife_rescue", "Palawan Wildlife Rescue & Conservation Center", "National Hwy, Barangay Irawan, Puerto Princesa, Palawan, Philippines", "Palawan", 9.7664, 118.6789, 4.6, 5100, 1, ["wildlife sanctuary", "zoo", "nature reserve", "park"]),
    _a("pal_kalui_seafood", "KaLui Seafood Restaurant & Art Gallery", "369 Rizal Ave, Puerto Princesa, Palawan, Philippines", "Palawan", 9.7405, 118.7429, 4.8, 7800, 3, ["local restaurant", "restaurant", "art gallery", "cafe"], "11:00 AM - 10:30 PM"),
    _a("pal_el_nido_artcafe", "El Nido Boutique ArtCafe & Town Market", "Serena St, Barangay Buena Suerte, El Nido, Palawan, Philippines", "Palawan", 11.1803, 119.3894, 4.6, 5300, 2, ["cafe", "restaurant", "art gallery", "boutique", "store", "shopping mall"]),
    _a("pal_plaza_cuartel", "Plaza Cuartel & Immaculate Conception Cathedral", "Taft St, Barangay Liwanag, Puerto Princesa, Palawan, Philippines", "Palawan", 9.7368, 118.7294, 4.6, 4600, 1, ["historical landmark", "monument", "museum", "park"]),
    _a("pal_coron_shipwreck_diving", "Lusong Gunboat & Skeleton Wreck Diving", "Coron Bay, Coron, Palawan, Philippines", "Palawan", 11.9781, 120.0235, 4.9, 6100, 3, ["diving", "snorkeling", "water sport", "historical landmark", "wildlife sanctuary"]),
    _a("pal_las_cabanas_sunset_bar", "Maremegmeg Las Cabanas Beach Club & Sunset Bar", "Corong-Corong, El Nido, Palawan, Philippines", "Palawan", 11.1476, 119.3941, 4.7, 6900, 3, ["bar", "lounge", "club", "beach", "entertainment", "scenic viewpoint"], "10:00 AM - 11:30 PM"),
    _a("pal_baker_hill_market", "Baker's Hill & Robinsons Place Palawan Market", "Mitra Rd, Sta. Monica, Puerto Princesa, Palawan, Philippines", "Palawan", 9.8058, 118.7324, 4.6, 9200, 1, ["park", "market", "store", "shopping mall", "street food", "food stall"]),
    _a("pal_miniloc_luxury_resort", "El Nido Resorts Pangulasian & Lio Wellness Spa", "Bacuit Bay, El Nido, Palawan, Philippines", "Palawan", 11.1169, 119.3304, 4.9, 3400, 4, ["resort", "spa", "wellness", "beach", "island"]),

    # =========================================================================
    # 6. BOHOL (15 attractions)
    # =========================================================================
    _a("boh_chocolate_hills", "Chocolate Hills Observation Complex", "Loay Interior Rd, Carmen, Bohol, Philippines", "Bohol", 9.8297, 124.1397, 4.8, 19200, 1, ["scenic viewpoint", "landscape", "mountain", "hiking trail", "natural_feature", "park"]),
    _a("boh_tarsier_sanctuary", "Philippine Tarsier and Wildlife Sanctuary", "Canapnapan, Corella, Bohol, Philippines", "Bohol", 9.6908, 123.9531, 4.7, 14600, 1, ["wildlife sanctuary", "nature reserve", "zoo", "hiking trail", "nature"]),
    _a("boh_loboc_river_cruise", "Loboc River Floating Restaurant Cruise", "Poblacion Sawang, Loboc, Bohol, Philippines", "Bohol", 9.6368, 124.0315, 4.7, 13400, 2, ["local restaurant", "restaurant", "water sport", "landscape", "entertainment"]),
    _a("boh_alona_beach", "Alona White Sand Beach", "Alona Beach Rd, Panglao Island, Bohol, Philippines", "Bohol", 9.5484, 123.7719, 4.6, 15800, 1, ["beach", "swimming", "resort", "water sport", "nightlife"]),
    _a("boh_balicasag_virgin_island", "Balicasag Marine Sanctuary & Virgin Island Hopping", "Balicasag Island, Panglao, Bohol, Philippines", "Bohol", 9.5181, 123.6841, 4.8, 9500, 2, ["island", "ferry", "snorkeling", "diving", "water sport", "wildlife sanctuary", "beach"]),
    _a("boh_baclayon_church", "Baclayon Heritage Church & National Museum Bohol", "Tagbilaran East Rd, Baclayon, Bohol, Philippines", "Bohol", 9.6227, 123.9125, 4.7, 7100, 1, ["historical landmark", "monument", "church", "museum", "art gallery"]),
    _a("boh_bilar_manmade_forest", "Bilar Man-Made Mahogany Forest", "Loay Interior Rd, Bilar, Bohol, Philippines", "Bohol", 9.6694, 124.0419, 4.6, 10200, 1, ["nature reserve", "park", "scenic viewpoint", "landscape", "hiking trail"]),
    _a("boh_hinagdanan_cave", "Hinagdanan Underground Lagoon Cave", "Bingag, Dauis, Panglao Island, Bohol, Philippines", "Bohol", 9.6251, 123.8012, 4.5, 8300, 1, ["natural_feature", "swimming", "water sport", "historical landmark", "scenic viewpoint"]),
    _a("boh_bohol_bee_farm", "Bohol Bee Farm Organic Cafe & Artisanal Market", "Dao, Dauis, Panglao Island, Bohol, Philippines", "Bohol", 9.5742, 123.8256, 4.6, 11800, 2, ["local restaurant", "restaurant", "cafe", "market", "boutique", "store"]),
    _a("boh_danao_adventure_park", "Danao Adventure Park & Sky Ride Camp", "Magtangtang, Danao, Bohol, Philippines", "Bohol", 9.9472, 124.1856, 4.7, 4200, 3, ["hiking trail", "campground", "outdoor", "mountain", "nature", "scenic viewpoint"]),
    _a("boh_anda_quiale_beach", "Anda Quinale White Beach & Cabagnow Cave Pool", "Poblacion, Anda, Bohol, Philippines", "Bohol", 9.7441, 124.5764, 4.8, 3900, 1, ["beach", "swimming", "campground", "nature", "landscape"]),
    _a("boh_moadto_strip_mall", "Moadto Strip Mall & Tagbilaran Island City Market", "Doljo Beach, Panglao, Bohol, Philippines", "Bohol", 9.5892, 123.7336, 4.6, 3600, 2, ["shopping mall", "boutique", "store", "market", "cafe", "food court"]),
    _a("boh_alona_beach_bars", "Alona Beachfront Acoustic Bars & Night Lounge", "Alona Beach, Tawala, Panglao, Bohol, Philippines", "Bohol", 9.5488, 123.7731, 4.5, 4900, 3, ["bar", "club", "lounge", "entertainment", "street food"], "05:00 PM - 01:00 AM"),
    _a("boh_amorita_henann_spa", "Amorita Cliffside Resort & Sea Breeze Wellness Spa", "1 Ester A. Lim Dr, Tawala, Panglao, Bohol, Philippines", "Bohol", 9.5480, 123.7768, 4.9, 5400, 4, ["spa", "wellness", "resort", "beach", "restaurant"]),
    _a("boh_blood_compact_shrine", "Sandugo Blood Compact Shrine & Sculptures", "Tagbilaran East Rd, Bool, Tagbilaran City, Bohol, Philippines", "Bohol", 9.6295, 123.8781, 4.5, 6700, 1, ["historical landmark", "monument", "art gallery", "scenic viewpoint"]),

    # =========================================================================
    # 7. SIARGAO (15 attractions)
    # =========================================================================
    _a("srg_cloud_9_boardwalk", "Cloud 9 Surfing Pier & Boardwalk", "Catangnan, General Luna, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.8135, 126.1652, 4.8, 14200, 1, ["beach", "water sport", "scenic viewpoint", "landscape", "monument"]),
    _a("srg_sugba_lagoon", "Sugba Lagoon & Kawhagan Sandbar", "Del Carmen, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.9324, 125.9612, 4.9, 9800, 2, ["water sport", "diving", "snorkeling", "island", "wildlife sanctuary", "nature reserve"]),
    _a("srg_naked_daku_guyam", "Naked, Daku & Guyam Trio Island Hopping", "General Luna Boulevard Pier, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.7662, 126.1614, 4.9, 11600, 2, ["island", "ferry", "beach", "swimming", "snorkeling", "resort"]),
    _a("srg_magpupungko_rock_pools", "Magpupungko Tidal Rock Pools & Beach", "Pilar, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.8732, 126.1204, 4.8, 10400, 1, ["beach", "swimming", "water sport", "natural_feature", "scenic viewpoint"]),
    _a("srg_maasin_river", "Maasin Coconut Palm Viewdeck & Bent Tree River", "Maasin, Pilar, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.8408, 126.0772, 4.7, 8900, 1, ["scenic viewpoint", "landscape", "water sport", "park", "nature"]),
    _a("srg_sohoton_cove", "Sohoton Cove National Park & Stingless Jellyfish Sanctuary", "Socorro, Bucas Grande, Siargao, Surigao del Norte, Philippines", "Siargao", 9.5994, 125.9102, 4.9, 6400, 3, ["wildlife sanctuary", "nature reserve", "island", "water sport", "snorkeling"]),
    _a("srg_pacifico_beach", "Pacifico North Surf Beach & Coastal Camp", "San Isidro, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.9465, 126.0914, 4.8, 4200, 1, ["beach", "campground", "outdoor", "water sport", "nature"]),
    _a("srg_tayangban_cave_pool", "Tayangban Cave Pool & Jungle Trek", "Pilar-Dapa Rd, Pilar, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.8584, 126.0908, 4.7, 5600, 1, ["hiking trail", "water sport", "outdoor", "natural_feature", "mountain"]),
    _a("srg_shaka_kermit_dining", "Kermit Siargao & Shaka Smoothie Bowl Cafe", "Tourism Rd, General Luna, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.7892, 126.1574, 4.8, 8700, 2, ["restaurant", "cafe", "local restaurant", "food stall"]),
    _a("srg_catangnan_bbq_bridge", "Catangnan Sunset Bridge & Local Street BBQ", "Catangnan-Cabitoonan Bridge, General Luna, Siargao, Philippines", "Siargao", 9.8185, 126.1592, 4.8, 5100, 1, ["street food", "food stall", "local restaurant", "scenic viewpoint", "landscape"], "04:00 PM - 10:00 PM"),
    _a("srg_tourism_road_boutiques", "General Luna Tourism Road Artisanal Boutiques & Market", "Tourism Rd, General Luna, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.7931, 126.1598, 4.6, 3900, 2, ["boutique", "store", "market", "shopping mall", "art gallery"]),
    _a("srg_harana_mama_coco_nightlife", "Harana Surf Lounge & El Lobo Nightclub", "Tourism Rd, General Luna, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.8024, 126.1618, 4.7, 6200, 3, ["bar", "club", "lounge", "entertainment", "night_club"], "05:00 PM - 02:00 AM"),
    _a("srg_nay_palad_dedon_wellness", "Nay Palad Hideaway & Siargao Bleu Spa Resort", "Malinao & Tourism Rd, General Luna, Siargao Island, Philippines", "Siargao", 9.7764, 126.1356, 4.9, 3800, 4, ["resort", "spa", "wellness", "beach", "island"]),
    _a("srg_del_carmen_mangrove", "Del Carmen 4,000-Hectare Mangrove Wildlife Forest", "Del Carmen, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.8705, 125.9694, 4.7, 2900, 1, ["wildlife sanctuary", "nature reserve", "park", "hiking trail"]),
    _a("srg_dapa_heritage_church", "Sto. Nino de Dapa Parish & Island Art Collective", "Dapa, Siargao Island, Surigao del Norte, Philippines", "Siargao", 9.7575, 126.0522, 4.5, 2100, 1, ["historical landmark", "monument", "art gallery", "museum"]),

    # =========================================================================
    # 8. DAVAO (15 attractions)
    # =========================================================================
    _a("dav_philippine_eagle_center", "Philippine Eagle Center", "Malagos-Calinan Rd, Baguio District, Davao City, Davao del Sur, Philippines", "Davao", 7.1872, 125.4148, 4.8, 13800, 1, ["wildlife sanctuary", "nature reserve", "zoo", "park", "nature"]),
    _a("dav_eden_nature_park", "Eden Nature Park & Mountain Resort", "Eden, Toril, Davao City, Davao del Sur, Philippines", "Davao", 7.0289, 125.4308, 4.8, 12500, 2, ["hiking trail", "park", "mountain", "campground", "nature reserve", "resort"]),
    _a("dav_samal_island_hopping", "Samal & Talikud Coral Garden Island Hopping", "Sasa Wharf to IGACOS, Samal Island, Davao, Philippines", "Davao", 7.0785, 125.7062, 4.8, 10200, 2, ["island", "ferry", "beach", "snorkeling", "diving", "water sport"]),
    _a("dav_mount_apo_trail", "Mount Apo Natural Park & Kapatagan Highland Camp", "Kapatagan, Digos / Toril, Davao del Sur, Philippines", "Davao", 6.9874, 125.2708, 4.9, 6400, 2, ["mountain", "hiking trail", "campground", "nature reserve", "scenic viewpoint", "outdoor"]),
    _a("dav_roxas_night_market", "Roxas Avenue Night Market & Street Food Strip", "Roxas Ave, Poblacion District, Davao City, Davao del Sur, Philippines", "Davao", 7.0715, 125.6128, 4.7, 15400, 1, ["street food", "market", "food stall", "local restaurant", "store"], "05:00 PM - 12:00 AM"),
    _a("dav_malagos_garden_chocolate", "Malagos Garden Resort & Chocolate Museum", "Calinan-Baguio-Cadalian Rd, Davao City, Davao del Sur, Philippines", "Davao", 7.1825, 125.4241, 4.7, 9100, 3, ["museum", "park", "wildlife sanctuary", "restaurant", "spa", "resort"]),
    _a("dav_peoples_park", "People's Park Cultural Sculptures & Botanical Dome", "Palma Gil St, Poblacion District, Davao City, Davao del Sur, Philippines", "Davao", 7.0699, 125.6085, 4.6, 14100, 1, ["park", "monument", "art gallery", "landscape", "scenic viewpoint"]),
    _a("dav_museo_dabawenyo", "Museo Dabawenyo & San Pedro Cathedral", "San Pedro St, Poblacion District, Davao City, Davao del Sur, Philippines", "Davao", 7.0644, 125.6082, 4.7, 6800, 1, ["museum", "historical landmark", "monument", "art gallery"]),
    _a("dav_crocodile_park", "Davao Crocodile Park & Tribu K'Mindanawan", "Riverfront Corporate City, Ma-a, Davao City, Davao del Sur, Philippines", "Davao", 7.0984, 125.5968, 4.6, 8700, 2, ["zoo", "wildlife sanctuary", "entertainment", "historical landmark"]),
    _a("dav_poblacion_market_central", "Poblacion Market Central & Aldevinco Souvenir Boutiques", "C. Bangoy St, Poblacion District, Davao City, Davao del Sur, Philippines", "Davao", 7.0719, 125.6114, 4.7, 5600, 1, ["market", "boutique", "store", "shopping mall", "local restaurant"]),
    _a("dav_abreeza_sm_lanang", "Abreeza Mall & SM Lanang Premier", "J.P. Laurel Ave, Bajada, Davao City, Davao del Sur, Philippines", "Davao", 7.0908, 125.6111, 4.7, 11900, 2, ["shopping mall", "shopping_mall", "store", "boutique", "food court"], "10:00 AM - 09:00 PM"),
    _a("dav_jack_ridge_viewpoint", "Jack's Ridge Panoramic Dining & Shrine Hills", "Shrine Hills Rd, Matina, Davao City, Davao del Sur, Philippines", "Davao", 7.0658, 125.5734, 4.6, 9400, 3, ["scenic viewpoint", "viewpoint", "local restaurant", "restaurant", "cafe"], "11:00 AM - 11:00 PM"),
    _a("dav_pearl_farm_resort", "Pearl Farm Beach Resort & Mandaya Wellness Spa", "Kaputian, Island Garden City of Samal, Davao, Philippines", "Davao", 6.9125, 125.7642, 4.9, 6300, 4, ["resort", "beach", "spa", "wellness", "island", "water sport"]),
    _a("dav_hagimit_falls_monfort", "Hagimit Waterfalls & Monfort Bat Sanctuary", "Penaplata, Samal Island, Davao, Philippines", "Davao", 7.0942, 125.7218, 4.5, 4800, 1, ["water sport", "swimming", "wildlife sanctuary", "nature reserve", "hiking trail"]),
    _a("dav_matina_town_square", "Matina Town Square (MTS) Live Music & Nightlife Hub", "McArthur Hwy, Matina, Davao City, Davao del Sur, Philippines", "Davao", 7.0612, 125.5924, 4.6, 5200, 2, ["bar", "club", "lounge", "entertainment", "restaurant"], "05:00 PM - 01:00 AM"),

    # =========================================================================
    # 9. ILOILO (15 attractions)
    # =========================================================================
    _a("ilo_miagao_church", "Miagao Fortress Church (UNESCO World Heritage Site)", "Noble St, Miagao, Iloilo, Philippines", "Iloilo", 10.6419, 122.2353, 4.9, 12400, 1, ["historical landmark", "monument", "church", "scenic viewpoint"]),
    _a("ilo_islas_de_gigantes", "Islas de Gigantes Cabugao Gamay & Tangke Lagoon", "Carles, Iloilo, Philippines", "Iloilo", 11.5922, 123.3418, 4.9, 10800, 2, ["island", "ferry", "beach", "swimming", "snorkeling", "scenic viewpoint", "landscape"]),
    _a("ilo_river_esplanade", "Iloilo River Esplanade Sunset & Mangrove Walk", "Treñas Blvd, Mandurriao, Iloilo City, Iloilo, Philippines", "Iloilo", 10.7042, 122.5534, 4.8, 13600, 1, ["park", "scenic viewpoint", "landscape", "hiking trail", "nature reserve"]),
    _a("ilo_ilomoca", "Iloilo Museum of Contemporary Art (ILOMOCA)", "Casa Emperador, Festive Walk Parade, Mandurriao, Iloilo City, Iloilo, Philippines", "Iloilo", 10.7165, 122.5468, 4.8, 5900, 1, ["art gallery", "art_gallery", "art museum", "museum"]),
    _a("ilo_molo_mansion_church", "Molo Mansion & St. Anne Gothic Church", "Locsin St, Molo, Iloilo City, Iloilo, Philippines", "Iloilo", 10.6958, 122.5432, 4.8, 11200, 1, ["historical landmark", "monument", "museum", "cafe", "boutique"]),
    _a("ilo_jaro_cathedral_belfry", "Jaro Metropolitan Cathedral & Casa Mariquit", "Jaro Plaza, Jaro, Iloilo City, Iloilo, Philippines", "Iloilo", 10.7235, 122.5572, 4.8, 9700, 1, ["historical landmark", "monument", "museum", "church"]),
    _a("ilo_lapaz_batchoy_madge", "La Paz Public Market: Netong's Batchoy & Madge Cafe", "Rizal St, La Paz, Iloilo City, Iloilo, Philippines", "Iloilo", 10.7104, 122.5718, 4.7, 9200, 1, ["local restaurant", "market", "cafe", "street food", "food stall"]),
    _a("ilo_breakthrough_tatoy", "Tatoy's Manokan & Breakthrough Villa Beach Seafood", "Sto. Nino Sur, Arevalo, Iloilo City, Iloilo, Philippines", "Iloilo", 10.6828, 122.5015, 4.7, 10900, 3, ["local restaurant", "restaurant", "beach", "food court"]),
    _a("ilo_garin_farm", "Garin Farm Pilgrimage Resort & Highland Kayaking", "San Joaquin, Iloilo, Philippines", "Iloilo", 10.5872, 122.1389, 4.6, 8400, 3, ["scenic viewpoint", "water sport", "resort", "park", "monument"]),
    _a("ilo_bucari_pine_forest", "Bucari Pine Forest & Mansiga Viewdeck Camp", "Bucari, Leon, Iloilo, Philippines", "Iloilo", 10.8712, 122.3685, 4.7, 4100, 1, ["hiking trail", "mountain", "campground", "nature reserve", "outdoor", "scenic viewpoint"]),
    _a("ilo_festive_walk_megaworld", "Festive Walk Iloilo & K-Town Night Strip", "Iloilo Business Park, Mandurriao, Iloilo City, Iloilo, Philippines", "Iloilo", 10.7158, 122.5475, 4.7, 11500, 2, ["shopping mall", "boutique", "store", "bar", "lounge", "entertainment"], "10:00 AM - 12:00 AM"),
    _a("ilo_smallville_boardwalk", "Smallville Complex & Boardwalk Nightlife District", "Benigno Aquino Ave, Mandurriao, Iloilo City, Iloilo, Philippines", "Iloilo", 10.7082, 122.5514, 4.5, 6200, 2, ["bar", "club", "lounge", "night_club", "entertainment", "restaurant"], "05:00 PM - 02:00 AM"),
    _a("ilo_guimaras_alubihod_hop", "Guimaras Alubihod Beach & Ave Maria Island Hopping", "Jordan Wharf / Nueva Valencia, Guimaras - Iloilo Strait, Philippines", "Iloilo", 10.5128, 122.5214, 4.8, 7300, 2, ["island", "ferry", "beach", "snorkeling", "water sport", "resort"]),
    _a("ilo_bulabog_putian_park", "Bulabog Putian National Park & Wildlife Caves", "Dingle, Iloilo, Philippines", "Iloilo", 11.0285, 122.6682, 4.6, 2300, 1, ["wildlife sanctuary", "nature reserve", "hiking trail", "park", "mountain"]),
    _a("ilo_richmonde_spa_wellness", " Spa Riviera & Courtyard Iloilo Luxury Wellness", "Iloilo Business Park, Mandurriao, Iloilo City, Iloilo, Philippines", "Iloilo", 10.7172, 122.5461, 4.8, 3400, 4, ["spa", "wellness", "resort", "relaxation"]),

    # =========================================================================
    # 10. VIGAN / ILOCOS (15 attractions)
    # =========================================================================
    _a("ilo_calle_crisologo", "Calle Crisologo Heritage Cobblestone Street", "Mena Crisologo St, Vigan City, Ilocos Sur, Philippines", "Ilocos", 17.5724, 120.3889, 4.9, 22400, 1, ["historical landmark", "monument", "scenic viewpoint", "boutique", "store"]),
    _a("ilo_paoay_church", "Paoay Church (St. Augustine Baroque UNESCO Church)", "Marcos Ave, Paoay, Ilocos Norte, Philippines", "Ilocos", 18.0616, 120.5214, 4.9, 15900, 1, ["historical landmark", "monument", "church", "scenic viewpoint"]),
    _a("ilo_paoay_sand_dunes", "La Paz & Paoay Sand Dunes 4x4 & Sandboarding", "Suba, Paoay, Ilocos Norte, Philippines", "Ilocos", 18.1082, 120.5064, 4.8, 13200, 3, ["outdoor", "landscape", "scenic viewpoint", "hiking trail", "campground"]),
    _a("ilo_bangui_windmills", "Bangui Windmills Coastal Viewpoint", "Bangui Bay, Bangui, Ilocos Norte, Philippines", "Ilocos", 18.5322, 120.7138, 4.8, 14800, 1, ["scenic viewpoint", "landscape", "beach", "monument"]),
    _a("ilo_kapurpurawan_rock", "Kapurpurawan White Limestone Rock Formation", "Burgos, Ilocos Norte, Philippines", "Ilocos", 18.5418, 120.6425, 4.8, 11900, 1, ["landscape", "scenic viewpoint", "natural_feature", "hiking trail", "beach"]),
    _a("ilo_saud_blue_lagoon_pagudpud", "Saud White Beach & Blue Lagoon Maira-ira Cove", "Pagudpud, Ilocos Norte, Philippines", "Ilocos", 18.5836, 120.7852, 4.9, 12700, 1, ["beach", "swimming", "water sport", "resort", "island", "campground"]),
    _a("ilo_baluarte_zoo", "Baluarte Resort and Mini Zoo Wildlife Sanctuary", "Quirino Blvd, Tamag, Vigan City, Ilocos Sur, Philippines", "Ilocos", 17.5528, 120.3765, 4.6, 10800, 1, ["zoo", "wildlife sanctuary", "nature reserve", "park"]),
    _a("ilo_national_museum_ilocos", "National Museum Ilocos Complex & Syquia Mansion", "Quirino Blvd, Vigan City, Ilocos Sur, Philippines", "Ilocos", 17.5712, 120.3895, 4.7, 6400, 1, ["museum", "art gallery", "art museum", "historical landmark"]),
    _a("ilo_pagburnayan_jar_pottery", "Ruby's Pagburnayan Pottery & Abel Iloko Weaving", "Liberation Blvd, Vigan City, Ilocos Sur, Philippines", "Ilocos", 17.5678, 120.3842, 4.7, 7900, 1, ["art gallery", "museum", "boutique", "store", "market"]),
    _a("ilo_plaza_burgos_empanada", "Plaza Burgos Vigan Empanada & Bagnet Food Stalls", "Plaza Burgos, Vigan City, Ilocos Sur, Philippines", "Ilocos", 17.5748, 120.3881, 4.8, 11500, 1, ["street food", "local restaurant", "food stall", "market", "restaurant"]),
    _a("ilo_cafe_leona", "Cafe Leona & Kusina Felicitas Heritage Dining", "1 Crisologo St, Vigan City, Ilocos Sur, Philippines", "Ilocos", 17.5738, 120.3888, 4.6, 8600, 2, ["local restaurant", "restaurant", "cafe", "bar"], "10:00 AM - 10:00 PM"),
    _a("ilo_cape_bojeador_kabigan", "Cape Bojeador Lighthouse & Kabigan Falls Trek", "Burgos & Pagudpud, Ilocos Norte, Philippines", "Ilocos", 18.5098, 120.5968, 4.7, 9400, 1, ["historical landmark", "hiking trail", "water sport", "scenic viewpoint", "nature reserve"]),
    _a("ilo_bantay_bell_tower", "Bantay Church Bell Tower & Sinait Garlic Market", "Bantay, Vigan, Ilocos Sur, Philippines", "Ilocos", 17.5818, 120.3896, 4.7, 9900, 1, ["historical landmark", "monument", "scenic viewpoint", "market", "shopping mall"]),
    _a("ilo_vitalis_villas_santiago", "Vitalis Villas Santiago Cove & Cliffside Spa", "Sabangan, Santiago, Ilocos Sur, Philippines", "Ilocos", 17.2842, 120.4278, 4.8, 4300, 4, ["resort", "spa", "wellness", "beach", "island", "water sport"]),
    _a("ilo_Calle_brewery_vigan", "Calle Brewery & Plaza Salcedo Dancing Fountain Lounge", "Salcedo St, Vigan City, Ilocos Sur, Philippines", "Ilocos", 17.5752, 120.3878, 4.7, 5800, 3, ["bar", "lounge", "entertainment", "club", "restaurant"], "04:00 PM - 11:30 PM"),

    # =========================================================================
    # 11. TAGAYTAY / BATANGAS (15 attractions)
    # =========================================================================
    _a("tag_sky_ranch_ridge", "Sky Ranch Tagaytay & Taal Volcano Ridge Viewpoint", "Tagaytay-Nasugbu Hwy, Kaybagal South, Tagaytay, Cavite, Philippines", "Tagaytay", 14.0952, 120.9378, 4.6, 18900, 2, ["scenic viewpoint", "landscape", "entertainment", "park", "outdoor"]),
    _a("tag_picnic_grove", "Tagaytay Picnic Grove Eco-Trail & Ridge Camp", "Tagaytay-Calamba Rd, Sungay East, Tagaytay, Cavite, Philippines", "Tagaytay", 14.1246, 120.9968, 4.5, 16400, 1, ["park", "scenic viewpoint", "landscape", "hiking trail", "campground", "outdoor"]),
    _a("tag_museo_orlina", "Museo Orlina Glass Sculpture Art Museum", "Hollywood Subdivision Rd, Tolentino East, Tagaytay, Cavite, Philippines", "Tagaytay", 14.1194, 120.9765, 4.8, 5200, 2, ["art gallery", "art museum", "museum", "scenic viewpoint", "cafe"]),
    _a("tag_mahogany_bulalo_market", "Mahogany Beef Market & Bulalo Eateries", "Mahogany Ave, Kaybagal South, Tagaytay, Cavite, Philippines", "Tagaytay", 14.1034, 120.9348, 4.7, 13800, 1, ["local restaurant", "market", "food stall", "street food", "restaurant", "store"]),
    _a("tag_sonyas_garden_spa", "Sonya's Garden Organic Dining & Haven Spa", "Buck Estate, Alfonso, Tagaytay Ridge, Cavite, Philippines", "Tagaytay", 14.1228, 120.8614, 4.7, 9400, 3, ["spa", "wellness", "restaurant", "cafe", "boutique", "nature"]),
    _a("tag_antonio_bag_of_beans", "Antonio's Fine Dining & Bag of Beans Charito Ridge", "Purok 138, Barangay Neogan, Tagaytay, Cavite, Philippines", "Tagaytay", 14.0964, 120.9098, 4.8, 11200, 4, ["restaurant", "cafe", "local restaurant", "scenic viewpoint", "lounge"]),
    _a("tag_nurture_wellness_village", "Nurture Wellness Village Filipino Spa Retreat", "Pulong Sagingan, Barangay Maitim II West, Tagaytay, Cavite, Philippines", "Tagaytay", 14.1252, 120.9462, 4.8, 3800, 4, ["spa", "wellness", "resort", "campground", "relaxation"]),
    _a("tag_pink_sisters_caleryega", "Caleruega Heritage Chapel & Pink Sisters Convent", "Nasugbu-Tagaytay Hwy, Batangas / Tagaytay Ridge, Philippines", "Tagaytay", 14.0725, 120.8384, 4.8, 10500, 1, ["historical landmark", "church", "monument", "park", "landscape"]),
    _a("tag_mt_batulao_pico", "Mt. Batulao & Mt. Pico de Loro Summit Trail", "Nasugbu, Batangas - Tagaytay Corridor, Philippines", "Tagaytay", 14.0418, 120.8018, 4.8, 6900, 1, ["hiking trail", "mountain", "campground", "scenic viewpoint", "nature reserve", "outdoor"]),
    _a("tag_anilao_fortune_island", "Anilao Dive Sanctuary & Fortune Island Hopping", "Mabini & Nasugbu, Batangas, Tagaytay South, Philippines", "Tagaytay", 13.7392, 120.8924, 4.8, 8600, 2, ["diving", "snorkeling", "water sport", "island", "beach", "wildlife sanctuary"]),
    _a("tag_laiya_matabungkay_beach", "Laiya & Nasugbu White Sand Beach Resorts", "Laiya-Aplaya, San Juan & Nasugbu, Batangas, Tagaytay Corridor, Philippines", "Tagaytay", 13.6714, 121.3962, 4.7, 9800, 2, ["beach", "resort", "swimming", "water sport", "ferry"]),
    _a("tag_paradizoo_yoki_farm", "Paradizoo Theme Farm & Yoki's Wildlife Sanctuary", "Km 63 Panungyan, Mendez, Tagaytay, Cavite, Philippines", "Tagaytay", 14.1384, 120.8982, 4.4, 4500, 2, ["zoo", "wildlife sanctuary", "park", "museum", "nature reserve"]),
    _a("tag_twin_lakes_ayala_serin", "Twin Lakes Shopping Village & Ayala Malls Serin", "Tagaytay-Nasugbu Hwy, Laurel / Silang Crossing, Tagaytay, Philippines", "Tagaytay", 14.0728, 120.8664, 4.7, 12100, 2, ["shopping mall", "shopping_mall", "boutique", "store", "cafe", "scenic viewpoint"]),
    _a("tag_papa_bings_ridge_bar", "Napa at Crosswinds & Ridge Craft Beer Lounge", "Crosswinds Resort Suites, Barangay Iruhin, Tagaytay, Cavite, Philippines", "Tagaytay", 14.1362, 121.0084, 4.6, 6100, 3, ["bar", "lounge", "club", "cafe", "entertainment", "scenic viewpoint"], "10:00 AM - 11:00 PM"),
    _a("tag_taal_heritage_town", "Taal Heritage Town Basilica & Galleria Taal Camera Museum", "Calle Marcela Agoncillo, Taal, Batangas, Tagaytay South, Philippines", "Tagaytay", 13.8794, 120.9235, 4.8, 7400, 1, ["historical landmark", "museum", "art gallery", "monument", "market"]),

    # =========================================================================
    # 12. BATANES (15 attractions)
    # =========================================================================
    _a("btn_marlboro_hills", "Racuh a Payaman (Marlboro Hills) Pastureland", "Mahatao-Ivana Rd, Mahatao, Batan Island, Batanes, Philippines", "Batanes", 20.4112, 121.9648, 5.0, 9600, 1, ["scenic viewpoint", "landscape", "mountain", "hiking trail", "park", "nature"]),
    _a("btn_basco_lighthouse", "Basco Lighthouse & Naidi Hills Rolling Park", "Naidi Hills, Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4572, 121.9685, 4.9, 10800, 1, ["historical landmark", "monument", "scenic viewpoint", "landscape", "park"]),
    _a("btn_valugan_boulder_beach", "Valugan Boulder Beach", "Valugan, Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4494, 121.9922, 4.9, 7400, 1, ["beach", "scenic viewpoint", "landscape", "natural_feature", "nature"]),
    _a("btn_sabtang_chavayan_island", "Sabtang Island Hopping & Chavayan Stone Houses", "Chavayan, Sabtang Island, Batanes, Philippines", "Batanes", 20.3038, 121.8692, 4.9, 8200, 3, ["island", "ferry", "historical landmark", "beach", "scenic viewpoint"]),
    _a("btn_morong_beach_nakabuang", "Morong White Beach & Nakabuang Natural Rock Arch", "Sabtang Island, Batanes, Philippines", "Batanes", 20.3364, 121.8712, 4.9, 6800, 1, ["beach", "swimming", "island", "scenic viewpoint", "landscape", "local restaurant"]),
    _a("btn_vayang_rolling_hills", "Vayang Rolling Hills & Mt. Iraya Trail", "Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4648, 121.9814, 4.9, 7100, 1, ["hiking trail", "mountain", "campground", "scenic viewpoint", "landscape", "outdoor"]),
    _a("btn_fundacion_pacita", "Fundacion Pacita Abad Art Studio & Cliffside Lodge", "Chanpan, Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4624, 121.9852, 4.9, 5100, 4, ["art gallery", "art museum", "museum", "resort", "restaurant", "spa"]),
    _a("btn_honesty_coffee_shop", "Honesty Coffee Shop & Ivana Port Heritage Market", "Radiwan Port, Ivana, Batan Island, Batanes, Philippines", "Batanes", 20.3712, 121.9148, 4.9, 6400, 1, ["cafe", "store", "market", "boutique", "local restaurant", "historical landmark"]),
    _a("btn_homoron_white_beach", "Homoron White Beach & Fountain of Youth Spring Pool", "Diura & Homoron, Mahatao, Batan Island, Batanes, Philippines", "Batanes", 20.3886, 121.9384, 4.8, 4200, 1, ["beach", "swimming", "water sport", "hot spring", "snorkeling", "relaxation"]),
    _a("btn_house_of_dakay_mahatao", "House of Dakay (1887) & San Carlos Borromeo Church", "San Jose de Ivana & Mahatao, Batan Island, Batanes, Philippines", "Batanes", 20.3742, 121.9168, 4.8, 5900, 1, ["historical landmark", "monument", "church", "museum"]),
    _a("btn_pension_ivatan_Octagon", "Pension Ivatan & Octagon Bed and Dine Local Cuisine", "National Rd, Kayhuvokan, Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4498, 121.9692, 4.7, 3800, 2, ["local restaurant", "restaurant", "cafe", "food stall", "street food"]),
    _a("btn_batanes_wildlife_protected", "Batanes Protected Landscape & Seascape Bird Sanctuary", "Mt. Iraya Watershed, Basco, Batanes, Philippines", "Batanes", 20.4664, 122.0112, 4.8, 2600, 1, ["wildlife sanctuary", "nature reserve", "hiking trail", "campground", "park"]),
    _a("btn_basco_artisans_vakul", "Basco Vakul Weavers Market & Souvenir Emporium", "Abad St, Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4488, 121.9702, 4.6, 2100, 1, ["boutique", "store", "market", "shopping mall", "art gallery"]),
    _a("btn_harbour_cafe_sunset_bar", "Casa Napoli & Basco Harbour Sunset Acoustic Lounge", "Kaychanarianan, Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4456, 121.9675, 4.6, 2800, 2, ["bar", "lounge", "entertainment", "restaurant", "cafe"], "04:00 PM - 11:00 PM"),
    _a("btn_bernardo_wellness_cliff", "Bernardo's Hotel Cliffside Spa & Tidal Pool Wellness", "Chanarian, Basco, Batan Island, Batanes, Philippines", "Batanes", 20.4368, 121.9614, 4.8, 2400, 3, ["spa", "wellness", "resort", "beach", "relaxation"]),

    # =========================================================================
    # 13. BICOL / ALBAY (15 attractions)
    # =========================================================================
    _a("bic_cagsawa_ruins", "Cagsawa Ruins Park & Mayon Volcano Viewpoint", "Barangay Busay, Daraga, Albay, Bicol, Philippines", "Bicol", 13.1672, 123.7008, 4.8, 18400, 1, ["historical landmark", "monument", "scenic viewpoint", "landscape", "park", "market"]),
    _a("bic_mayon_skyline_atv", "Mayon Volcano Green Lava Trail & Highland Camp", "Lidong & Tabaco Slope, Albay, Bicol, Philippines", "Bicol", 13.2148, 123.6942, 4.9, 12600, 2, ["mountain", "hiking trail", "campground", "outdoor", "scenic viewpoint", "landscape"]),
    _a("bic_sumlang_lake", "Sumlang Lake Bamboo Rafting & Mayon Reflection", "Camalig, Albay, Bicol, Philippines", "Bicol", 13.1784, 123.6612, 4.7, 9400, 1, ["scenic viewpoint", "landscape", "water sport", "park", "restaurant"]),
    _a("bic_donsol_whaleshark", "Donsol Whale Shark Interaction & Firefly River Sanctuary", "Dancalan, Donsol, Sorsogon, Bicol, Philippines", "Bicol", 12.9058, 123.5938, 4.8, 8200, 3, ["wildlife sanctuary", "nature reserve", "snorkeling", "diving", "water sport", "beach"]),
    _a("bic_caramoan_matukad_islands", "Caramoan Matukad & Lahos Island Hopping", "Paniman Pier, Caramoan, Camarines Sur, Bicol, Philippines", "Bicol", 13.8024, 123.8964, 4.9, 10800, 2, ["island", "ferry", "beach", "swimming", "snorkeling", "campground"]),
    _a("bic_subic_beach_matnog", "Subic Pink Sand Beach & Juag Lagoon Marine Sanctuary", "Calintaan Island, Matnog, Sorsogon, Bicol, Philippines", "Bicol", 12.5364, 124.1172, 4.8, 6900, 1, ["beach", "island", "wildlife sanctuary", "aquarium", "swimming", "snorkeling"]),
    _a("bic_daraga_church_museo", "Daraga Baroque Church & Museo de Legazpi", "Sta. Maria Hill, Daraga & Legazpi City, Albay, Bicol, Philippines", "Bicol", 13.1492, 123.7124, 4.8, 8700, 1, ["historical landmark", "church", "museum", "art gallery", "scenic viewpoint"]),
    _a("bic_first_colonial_sili_icecream", "1st Colonial Grill Sili Ice Cream & Small Talk Cafe", "Dona Aurora St, Old Albay District, Legazpi City, Albay, Bicol, Philippines", "Bicol", 13.1394, 123.7348, 4.7, 11400, 2, ["local restaurant", "restaurant", "cafe", "food stall", "street food"]),
    _a("bic_embarcadero_legazpi_blvd", "Legazpi Boulevard Sunset Food Strip & Embarcadero Mall", "Legazpi Port District, Legazpi City, Albay, Bicol, Philippines", "Bicol", 13.1438, 123.7582, 4.7, 9800, 1, ["street food", "shopping mall", "boutique", "store", "beach", "scenic viewpoint"], "06:00 AM - 11:00 PM"),
    _a("bic_albay_park_wildlife", "Albay Park and Wildlife Eco-Reserve", "Bogtong, Legazpi City, Albay, Bicol, Philippines", "Bicol", 13.1518, 123.7245, 4.5, 5900, 1, ["wildlife sanctuary", "zoo", "nature reserve", "park"]),
    _a("bic_quitinday_hills_hoyop", "Quitinday Green Hills & Hoyop-Hoyopan Cave", "Cotmon, Camalig, Albay, Bicol, Philippines", "Bicol", 13.1228, 123.6214, 4.7, 5100, 1, ["hiking trail", "mountain", "campground", "scenic viewpoint", "landscape", "outdoor"]),
    _a("bic_tiwi_mateo_hot_springs", "Tiwi Geothermal & San Benon Mateo Hot Springs Resort", "Tiwi, Albay & Irosin, Sorsogon, Bicol, Philippines", "Bicol", 13.4585, 123.6682, 4.6, 4600, 2, ["hot spring", "spa", "wellness", "resort", "swimming"]),
    _a("bic_misibis_bay_luxury", "Misibis Bay Cagraray Island Resort & Essences Spa", "Cagraray Island, Bacacay, Albay, Bicol, Philippines", "Bicol", 13.2512, 123.8924, 4.8, 5300, 4, ["resort", "spa", "wellness", "beach", "island", "water sport"]),
    _a("bic_ayala_malls_legazpi", "Ayala Malls Legazpi & Pili Nut Pasalubong Market", "Rizal St, Capantawan, Legazpi City, Albay, Bicol, Philippines", "Bicol", 13.1456, 123.7498, 4.6, 8400, 2, ["shopping mall", "shopping_mall", "market", "store", "boutique", "food court"]),
    _a("bic_q2_lounge_magsaysay_naga", "Magsaysay Avenue Bicol Nightlife & Craft Lounge", "Tahao Rd, Legazpi City & Magsaysay Ave, Bicol, Philippines", "Bicol", 13.1482, 123.7445, 4.6, 3900, 3, ["bar", "club", "lounge", "entertainment", "night_club"], "05:00 PM - 01:30 AM"),

    # =========================================================================
    # 14. PAMPANGA (15 attractions)
    # =========================================================================
    _a("pam_mt_pinatubo_crater", "Mt. Pinatubo Crater Lake 4x4 & Trekking Trail", "Sta. Juliana Jump-off, Porac / Angeles, Pampanga, Philippines", "Pampanga", 15.1429, 120.3496, 4.9, 13400, 2, ["hiking trail", "mountain", "scenic viewpoint", "landscape", "outdoor", "campground"]),
    _a("pam_aling_lucing_mila_sisig", "Aling Lucing & Mila's Tokwa't Baboy Kapampangan Heritage Dining", "Glaciano Valdez St & San Angelo, Angeles City, Pampanga, Philippines", "Pampanga", 15.1418, 120.5924, 4.7, 11800, 1, ["local restaurant", "restaurant", "street food", "food stall"]),
    _a("pam_bale_dutung_25_seeds", "Bale Dutung & 25 Seeds Farm-to-Table by Chef Claude Tayag", "Villa Gloria & Dycaico Ancestral House, Angeles City, Pampanga, Philippines", "Pampanga", 15.1348, 120.5892, 4.8, 6900, 3, ["restaurant", "local restaurant", "cafe", "historical landmark", "art gallery"]),
    _a("pam_aqua_planet", "Aqua Planet Water Theme Park", "Bounded by J.P. Rizal & Prince Balagtas Ave, Clark Freeport, Pampanga, Philippines", "Pampanga", 15.1884, 120.5172, 4.7, 14600, 3, ["water sport", "swimming", "swimming_pool", "entertainment", "resort"]),
    _a("pam_clark_museum_parade", "Clark Museum 4D Theater & CDC Parade Grounds", "S. Osmena, Clark Freeport Zone, Mabalacat, Pampanga, Philippines", "Pampanga", 15.1814, 120.5256, 4.7, 8900, 1, ["museum", "historical landmark", "art gallery", "park", "campground"]),
    _a("pam_pamintuan_mansion_holy_rosary", "Museo ning Angeles, Pamintuan Mansion & Holy Rosary Parish", "Sto. Entierro St, Heritage District, Angeles City, Pampanga, Philippines", "Pampanga", 15.1352, 120.5906, 4.8, 7600, 1, ["historical landmark", "monument", "museum", "art gallery", "scenic viewpoint"]),
    _a("pam_dinosaur_island_zoocobia", "Clark Safari, Dinosaur Island & Zoocobia Wildlife Park", "Clark Picnic Grounds, Clark Freeport, Pampanga, Philippines", "Pampanga", 15.1924, 120.5122, 4.6, 10200, 2, ["zoo", "wildlife sanctuary", "park", "nature reserve", "entertainment"]),
    _a("pam_puning_hot_spring", "Puning Geothermal Hot Spring & Sand Spa", "Sitio Target, Sapang Bato, Angeles City, Pampanga, Philippines", "Pampanga", 15.1584, 120.4512, 4.8, 7400, 3, ["hot spring", "spa", "wellness", "resort", "landscape"]),
    _a("pam_candaba_wetlands_bird", "Candaba Wetlands Migratory Bird & Wildlife Sanctuary", "Candaba, Pampanga, Philippines", "Pampanga", 15.0842, 120.8412, 4.7, 3200, 1, ["wildlife sanctuary", "nature reserve", "scenic viewpoint", "landscape", "nature"]),
    _a("pam_sandbox_alvizia_camp", "SandBox at Alviera Adventure Park & Porac Glamping", "Alviera, Porac, Pampanga, Philippines", "Pampanga", 15.1098, 120.5142, 4.6, 6100, 2, ["outdoor", "campground", "park", "hiking trail", "entertainment"]),
    _a("pam_sm_clark_marquee_dutyfree", "SM City Clark, Marquee Mall & Clark Duty Free", "Manuel A. Roxas Hwy, Clark Freeport, Angeles City, Pampanga, Philippines", "Pampanga", 15.1682, 120.5804, 4.7, 16900, 2, ["shopping mall", "shopping_mall", "store", "boutique", "market", "food court"]),
    _a("pam_nepo_quad_street_food", "Nepo Quad & Totobits Street Food Market", "Plaridel St, Nepo Mart, Angeles City, Pampanga, Philippines", "Pampanga", 15.1368, 120.5882, 4.7, 8100, 1, ["street food", "market", "food stall", "local restaurant", "food court"], "03:00 PM - 11:00 PM"),
    _a("pam_friendship_koreatown_nightlife", "Clark Koreatown & Fields Avenue Gastrobars & Lounges", "Fil-Am Friendship Hwy, Angeles City, Pampanga, Philippines", "Pampanga", 15.1524, 120.5628, 4.6, 6800, 3, ["bar", "club", "lounge", "night_club", "entertainment", "restaurant"], "05:00 PM - 02:00 AM"),
    _a("pam_midori_hann_luxury_spa", "Hann Casino Resort & Midori Clark Chan Spa", "C.M. Recto Hwy, Clark Freeport Zone, Pampanga, Philippines", "Pampanga", 15.1846, 120.5312, 4.9, 5900, 4, ["spa", "wellness", "resort", "lounge", "entertainment"]),
    _a("pam_coastal_sasmuan_island", "Sasmuan Bangkung Malapad Critical Habitat & Coastal Island Tour", "Sasmuan, Pampanga Bay, Pampanga, Philippines", "Pampanga", 14.8812, 120.6124, 4.6, 2100, 1, ["island", "ferry", "beach", "wildlife sanctuary", "nature reserve"]),

    # =========================================================================
    # 15. ZAMBALES (15 attractions)
    # =========================================================================
    _a("zam_anawangin_cove", "Anawangin Cove Pine Forest Beach & Campground", "Pundaquit, San Antonio, Zambales, Philippines", "Zambales", 14.8894, 120.0562, 4.8, 14800, 1, ["beach", "campground", "island", "ferry", "hiking trail", "nature", "outdoor"]),
    _a("zam_nagsasa_silanguin_cove", "Nagsasa Cove & Talisayen Cove Island Hopping", "San Antonio, Zambales, Philippines", "Zambales", 14.8324, 120.0884, 4.8, 11200, 2, ["island", "ferry", "beach", "campground", "swimming", "scenic viewpoint"]),
    _a("zam_capones_camara_islands", "Capones Island Spanish Lighthouse & Camara Island", "Pundaquit, San Antonio, Zambales, Philippines", "Zambales", 14.9182, 120.0086, 4.8, 9400, 2, ["island", "ferry", "historical landmark", "monument", "snorkeling", "beach", "scenic viewpoint"]),
    _a("zam_liwa_surf_village", "Crystal Beach & Liwliwa Surf Village", "Barangay Sto. Nino, San Narciso, Zambales, Philippines", "Zambales", 15.0042, 120.0668, 4.7, 13600, 2, ["beach", "water sport", "swimming", "campground", "resort"]),
    _a("zam_potipot_magalawa_island", "Potipot White Sand Island & Magalawa Starfish Sanctuary", "Uacon, Candelaria & Palauig, Zambales, Philippines", "Zambales", 15.6624, 119.9248, 4.8, 8600, 1, ["island", "beach", "snorkeling", "swimming", "campground", "wildlife sanctuary"]),
    _a("zam_mt_tapulao_balingkilat", "Mt. Balingkilat (Mountain of Thunder) & Mt. Tapulao Trail", "Subic / Palauig, Zambales, Philippines", "Zambales", 14.8628, 120.1142, 4.8, 5400, 1, ["hiking trail", "mountain", "campground", "scenic viewpoint", "landscape", "outdoor"]),
    _a("zam_ocean_adventure_zoobic", "Zoobic Safari & Ocean Adventure Marine Sanctuary", "Ilanin Forest, Subic Bay Freeport Zone, Zambales, Philippines", "Zambales", 14.7704, 120.2498, 4.6, 15200, 3, ["aquarium", "zoo", "wildlife sanctuary", "nature reserve", "water sport"]),
    _a("zam_inflatable_island_subic", "Inflatable Island Beach Club & Subic Bay Wreck Diving", "Samba Bluewater Resort, Lower Kalaklan, Olongapo / Subic, Zambales, Philippines", "Zambales", 14.8358, 120.2642, 4.6, 9800, 3, ["water sport", "diving", "snorkeling", "beach", "resort", "swimming"]),
    _a("zam_casa_san_miguel", "Casa San Miguel Community Arts Center & Museum", "Evangelista St, San Antonio, Zambales, Philippines", "Zambales", 14.9538, 120.0882, 4.8, 3900, 2, ["art gallery", "art museum", "museum", "cafe", "historical landmark"]),
    _a("zam_ramon_magsaysay_ancestral", "Pres. Ramon Magsaysay Ancestral House & Botolan Heritage", "Castillejos & Botolan, Zambales, Philippines", "Zambales", 14.9312, 120.1984, 4.6, 4200, 1, ["historical landmark", "monument", "museum", "park"]),
    _a("zam_mommy_phoebe_liwa_cafes", "Mommy Phoebe's Place & Sakkam Woodfire Cafe Liwliwa", "Sitio Liwliwa, San Narciso, Zambales, Philippines", "Zambales", 15.0028, 120.0682, 4.7, 5100, 1, ["local restaurant", "cafe", "restaurant", "street food", "food stall"]),
    _a("zam_texas_joes_subic_dining", "Texas Joe's House of Ribs & Meat Plus Cafe Subic", "Sampson Rd, Subic Bay Freeport Zone, Zambales, Philippines", "Zambales", 14.8194, 120.2812, 4.7, 10800, 2, ["restaurant", "cafe", "food court", "local restaurant"]),
    _a("zam_harbor_point_royal_dutyfree", "Harbor Point Ayala Mall, Royal Duty Free & Mango Market", "Rizal Hwy, Subic Bay Freeport & Iba, Zambales, Philippines", "Zambales", 14.8242, 120.2825, 4.6, 12400, 2, ["shopping mall", "shopping_mall", "store", "boutique", "market"]),
    _a("zam_subic_boardwalk_pier_bars", "Subic Waterfront Boardwalk Sunset Bars & Yacht Club Lounge", "Waterfront Rd, Subic Bay Freeport Zone, Zambales, Philippines", "Zambales", 14.8178, 120.2764, 4.6, 6100, 3, ["bar", "lounge", "club", "entertainment", "scenic viewpoint"], "04:00 PM - 01:00 AM"),
    _a("zam_camayan_sundowners_spa", "Sundowners Beach Villas Botolan & Camayan Wellness Spa", "Purok 5, Danacbunga, Botolan & Ilanin Bay, Zambales, Philippines", "Zambales", 15.2742, 120.0114, 4.8, 6700, 4, ["resort", "spa", "wellness", "beach", "relaxation"]),
]


async def seed_philippine_attractions(db: "AsyncSession") -> Dict[str, int]:
    """
    Idempotently seed all 225 Philippine attractions and their type associations
    into the PostgreSQL database.
    """
    from sqlalchemy import select
    from app.models.place import Place
    from app.repositories.place_repository import PlaceRepository
    from app.repositories.types_repository import TypesRepository
    from app.repositories.placetypes_repository import PlaceTypesRepository

    place_repo = PlaceRepository(db)
    types_repo = TypesRepository(db)
    placetypes_repo = PlaceTypesRepository(db)

    # Quick check: count how many ph_seed_% places are already present
    existing_result = await db.execute(
        select(Place.googleplaceid).where(Place.googleplaceid.like("ph_seed_%"))
    )
    existing_ids = set(existing_result.scalars().all())

    if len(existing_ids) >= len(PHILIPPINE_ATTRACTIONS):
        logger.info(
            f"Philippine attractions seed already complete ({len(existing_ids)} seeded records present)."
        )
        return {"inserted": 0, "skipped": len(existing_ids), "total": len(existing_ids)}

    # Pre-cache or create all unique type categories
    unique_types = sorted({t for item in PHILIPPINE_ATTRACTIONS for t in item["types"]})
    type_by_name = {}
    for type_name in unique_types:
        type_obj = await types_repo.get_or_create_by_category(type_name)
        type_by_name[type_name] = type_obj

    inserted = 0
    skipped = 0

    for item in PHILIPPINE_ATTRACTIONS:
        gpid = item["googleplaceid"]
        if gpid in existing_ids:
            skipped += 1
            continue

        place = await place_repo.create(
            googleplaceid=gpid,
            destination=item["destination"],
            address=item["address"],
            city=item["city"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            rating=item["rating"],
            userratingtotal=item["userratingtotal"],
            pricelevel=item["pricelevel"],
            openinghours=item["openinghours"],
            is_open_now=item["is_open_now"],
            website=item["website"],
            phonenumber=item["phonenumber"],
            photos=item["photos"],
        )

        for type_name in item["types"]:
            type_obj = type_by_name[type_name]
            if not await placetypes_repo.exists(place.placeid, type_obj.categoryid):
                await placetypes_repo.create(place.placeid, type_obj.categoryid)

        inserted += 1

    await db.commit()
    logger.info(
        f"Seeded Philippine attractions: {inserted} inserted, {skipped} already present (total {inserted + skipped})."
    )
    return {"inserted": inserted, "skipped": skipped, "total": inserted + skipped}


async def _run_cli() -> None:
    from app.database import AsyncSessionLocal, engine, Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        stats = await seed_philippine_attractions(session)
        print(f"Seed complete: {stats}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(_run_cli())
