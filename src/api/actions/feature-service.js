import api from "@/api/api";

export async function getAllFeatures() {
  return await api().get("/api/v1/feature/");
}

export async function getFeatureById(id) {
  if (!id) throw new Error("Feature ID is required");
  return await api().get(`/api/v1/feature/${id}/`);
}

export async function enableFeature(id) {
  if (!id) throw new Error("Feature ID is required");
  return await api().post(`/api/v1/feature/${id}/enable/`);
}

export async function disableFeature(id) {
  if (!id) throw new Error("Feature ID is required");
  return await api().post(`/api/v1/feature/${id}/disabled/`);
}

export async function initialEnableDiscover(discoverFeatureId, featureIds) {
  if (!discoverFeatureId) throw new Error("Discover feature ID is required");
  if (!featureIds || !Array.isArray(featureIds))
    throw new Error("Feature IDs must be an array");

  return await api().post(`/api/v1/feature/${discoverFeatureId}/enable/`, {
    feature_ids: featureIds,
  });
}
