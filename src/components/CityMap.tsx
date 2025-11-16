import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3-geo';
import type { CityMeta } from '../App';

type Props = {
	city: CityMeta;
	metersPerPixel: number;
};

type FeatureCollection = {
	type: 'FeatureCollection';
	features: Array<{
		type: 'Feature';
		properties: Record<string, unknown>;
		geometry: {
			type: 'Polygon' | 'MultiPolygon';
			coordinates: number[][][] | number[][][][];
		};
	}>;
};

const EARTH_RADIUS_METERS = 6378137; // Web Mercator sphere

export function CityMap({ city, metersPerPixel }: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [geo, setGeo] = useState<FeatureCollection | null>(null);
	const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

	// Resize observer for responsive canvas
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				setSize({ width: cr.width, height: cr.height });
			}
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	// Load GeoJSON
	useEffect(() => {
		let cancelled = false;
		fetch(city.geojsonPath)
			.then((r) => r.json())
			.then((data: FeatureCollection) => {
				if (!cancelled) setGeo(data);
			})
			.catch(() => {
				// ignore
			});
		return () => {
			cancelled = true;
		};
	}, [city.geojsonPath]);

	const view = useMemo(() => {
		if (!geo || size.width === 0 || size.height === 0) return null;

		// Compute city center latitude to adjust Mercator meters/px at latitude
		const centroid = d3.geoCentroid(geo);
		const lat = city.centerLat ?? centroid[1] ?? 0;
		const cosPhi = Math.cos((lat * Math.PI) / 180);

		// Mercator scale: pixels per radian = scale
		// meters per pixel at latitude ≈ (R * cos(phi)) / scale
		// => scale = (R * cos(phi)) / mpp
		const mercatorScale = (EARTH_RADIUS_METERS * Math.max(0.000001, cosPhi)) / Math.max(1, metersPerPixel);

		const projection = d3.geoMercator().scale(mercatorScale).translate([0, 0]);
		const path = d3.geoPath(projection);

		// project all points to determine bounds in pixels at the unified scale
		const bounds = path.bounds(geo as unknown as GeoJSON.FeatureCollection);
		const [x0, y0] = bounds[0];
		const [x1, y1] = bounds[1];
		const w = x1 - x0;
		const h = y1 - y0;

		// add padding
		const pad = 16;
		const vw = Math.max(10, size.width - pad * 2);
		const vh = Math.max(10, size.height - pad * 2);

		// If the unified scale makes it too large for the box, we can apply a uniform downscale
		const downscale = Math.min(1, Math.min(vw / w, vh / h));

		// compute translation to center within viewport
		const tx = pad + (vw - w * downscale) / 2 - x0 * downscale;
		const ty = pad + (vh - h * downscale) / 2 - y0 * downscale;

		return { path, downscale, translate: [tx, ty] as [number, number], bounds: { w, h } };
	}, [geo, size.width, size.height, metersPerPixel, city.centerLat]);

	if (!view) {
		return <div ref={containerRef} className="citymap-container" />;
	}

	return (
		<div ref={containerRef} className="citymap-container">
			<svg className="citymap-svg" width="100%" height="100%" viewBox={`0 0 ${size.width} ${size.height}`}>
				<g transform={`translate(${view.translate[0]}, ${view.translate[1]}) scale(${view.downscale})`}>
					<path
						d={view.path(geo as unknown as GeoJSON.FeatureCollection) || ''}
						className="citymap-boundary"
					/>
				</g>
			</svg>
		</div>
	);
}


