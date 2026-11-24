import { base44 } from "@/api/base44Client";
import { COMPACT_ABOVE, FILE_ABOVE, encodeGrid, gridOf, previewGrid } from "@/lib/gridCodec";

/**
 * Turns a finished grid into the fields an Artwork record can hold.
 * Small maps keep the grid itself; medium ones are stored compactly; grand
 * ones keep a 48-square preview inline and put the full grid in a private file
 * (stored privately), because a record cannot hold 65,536 numbers.
 */
export async function storeGrid(grid) {
  const size = grid.length;
  if (size > FILE_ABOVE) {
    const json = JSON.stringify(grid);
    const file = new File([json], `map-${size}.json`, { type: "application/json" });
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    return { target_grid: previewGrid(grid), target_compact: "", map_file: file_uri };
  }
  if (size > COMPACT_ABOVE) {
    return { target_grid: previewGrid(grid), target_compact: encodeGrid(grid), map_file: "" };
  }
  return { target_grid: grid, target_compact: "", map_file: "" };
}

/** The full grid of a saved map, fetching the private file when there is one. */
export async function loadFullGrid(artwork) {
  if (artwork?.map_file) {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: artwork.map_file });
    const response = await fetch(signed_url);
    if (!response.ok) throw new Error("Map file unavailable");
    return response.json();
  }
  return gridOf(artwork);
}