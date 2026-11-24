import PixelCellGrid from "@/components/studio/PixelCellGrid";
import PixelCanvasGrid from "@/components/studio/PixelCanvasGrid";

// Small canvases keep their crisp cell-by-cell grid; the big ones are painted
// to a canvas so tens of thousands of squares stay smooth.
export default function StudioCanvas(props) {
  return props.size > 48 ? <PixelCanvasGrid {...props} /> : <PixelCellGrid {...props} />;
}