const BASE_URL = "https://psgc.cloud/api";

export const getRegions = async () => {
  const response = await fetch(`${BASE_URL}/regions`);
  return response.json();
};

export const getProvinces = async (regionCode) => {
  const response = await fetch(
    `${BASE_URL}/regions/${regionCode}/provinces`
  );

  return response.json();
};

export const getCities = async (provinceCode) => {
  const response = await fetch(
    `${BASE_URL}/provinces/${provinceCode}/cities-municipalities`
  );

  return response.json();
};

export const getBarangays = async (cityCode) => {
  const response = await fetch(
    `${BASE_URL}/cities-municipalities/${cityCode}/barangays`
  );

  return response.json();
};