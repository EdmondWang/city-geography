import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CityMap } from './components/CityMap';
import { CitySelector } from './components/CitySelector';
import { CityDetail } from './pages/CityDetail';

export type CityMeta = {
	id: string;
	name: string;
	country?: string;
	// optional preferred meters-per-pixel override for this city
	preferredMpp?: number;
	// center latitude to refine Mercator scale at latitude
	centerLat?: number;
	// path to GeoJSON (Polygon/MultiPolygon) of administrative boundary
	geojsonPath: string;
};

function HomePage({ metersPerPixel }: { metersPerPixel: number }) {
	const [cities, setCities] = useState<CityMeta[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		fetch('/data/cities.json')
			.then((r) => r.json())
			.then((data: CityMeta[]) => {
				setCities(data);
				if (data.length > 0) {
					setSelectedIds([data[0].id]);
				}
			})
			.catch(() => {
				// ignore
			});
	}, []);

	const selectedCities = useMemo(
		() => cities.filter((c) => selectedIds.includes(c.id)),
		[cities, selectedIds]
	);

	const handleToggleCity = (id: string) => {
		setSelectedIds((prev) => {
			if (prev.includes(id)) return prev.filter((x) => x !== id);
			return [...prev, id].slice(-4); // limit max 4 for layout
		});
	};

	return (
		<>
			<main className="app-main">
				<aside className="sidebar">
					<CitySelector
						cities={cities}
						selectedIds={selectedIds}
						onToggleCity={handleToggleCity}
					/>
					<p className="hint">
						选择 1-4 个城市进行对比。比例越小图越大；统一比例保证不同城市可直观比较面积。
					</p>
				</aside>
				<section className={`canvas-grid cols-${Math.max(1, Math.min(4, selectedCities.length || 1))}`}>
					{selectedCities.map((city) => (
						<div key={city.id} className="canvas-item">
							<div className="canvas-title">
								{city.name}
								{city.country ? `，${city.country}` : ''}
								<button className="link-btn" onClick={() => navigate(`/city/${city.id}`)}>详情</button>
							</div>
							<CityMap
								city={city}
								metersPerPixel={city.preferredMpp ?? metersPerPixel}
							/>
						</div>
					))}
					{selectedCities.length === 0 && (
						<div className="empty">请选择左侧的城市开始</div>
					)}
				</section>
			</main>
		</>
	);
}

export default function App() {
	const [metersPerPixel, setMetersPerPixel] = useState<number>(2000);
	return (
		<div className="app-root">
			<header className="app-header">
				<div className="title"><a href="/" className="brand">城市大小比较</a></div>
				<div className="controls">
					<label className="mpp">
						<span>比例（米/像素）</span>
						<input
							type="range"
							min={100}
							max={20000}
							step={100}
							value={metersPerPixel}
							onChange={(e) => setMetersPerPixel(parseInt(e.target.value, 10))}
						/>
						<span className="value">{metersPerPixel.toLocaleString()} m/px</span>
					</label>
				</div>
			</header>
			<Routes>
				<Route path="/" element={<HomePage metersPerPixel={metersPerPixel} />} />
				<Route path="/city/:id" element={<CityDetail defaultMetersPerPixel={metersPerPixel} />} />
			</Routes>
			<footer className="app-footer">
				<span>React + Vite + D3 • 统一比例渲染</span>
			</footer>
		</div>
	);
}

