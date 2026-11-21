import { appelerApi } from "./client";

// GET /api/notifications -> { nombre_non_lues, notifications: [...] }
export function recupererNotifications() {
  return appelerApi("/api/notifications");
}

// POST /api/notifications/{id}/lue
export function marquerNotificationLue(identifiant) {
  return appelerApi("/api/notifications/" + identifiant + "/lue", { method: "POST" });
}

// POST /api/notifications/tout-lire
export function marquerToutesLues() {
  return appelerApi("/api/notifications/tout-lire", { method: "POST" });
}