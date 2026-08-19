import { create } from "zustand"

interface DatasetState {
  selectedDatasetId: string | null
  setSelectedDatasetId: (id: string | null) => void
}

const initialSelectedId = typeof window !== "undefined" ? localStorage.getItem("selectedDatasetId") : null

export const useDatasetStore = create<DatasetState>((set) => ({
  selectedDatasetId: initialSelectedId,
  setSelectedDatasetId: (id) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("selectedDatasetId", id)
      } else {
        localStorage.removeItem("selectedDatasetId")
      }
    }
    set({ selectedDatasetId: id })
  },
}))
