export interface Instance {
  id: string;
  name: string;
}

export const INSTANCES: Instance[] = [
  { id: "benings_brand_analysis_01_2026", name: "Benings" },
  { id: "bukalapak", name: "Bukalapak" },
  { id: "mitra_bukalapak_dashboard", name: "Mitra Bukalapak" },
];

export const DEFAULT_INSTANCE_ID = INSTANCES[0]?.id ?? "default";

export function getInstanceById(id: string): Instance | undefined {
  return INSTANCES.find((i) => i.id === id);
}

export function getInstanceName(id: string): string {
  return getInstanceById(id)?.name ?? id;
}
