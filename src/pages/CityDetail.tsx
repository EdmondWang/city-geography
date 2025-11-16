import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CityMap } from '../components/CityMap';
import type { CityMeta } from '../App';

type CityMetadata = {
	name: string;
	country?: string;
	population?: number;
	areaKm2?: number;
	densityPerKm2?: number;
	coordinates?: { lat: number; lon: number };
	region?: string;
	history?: string; // markdown/plain
};

type Props = {
	defaultMetersPerPixel: number;
};

export function CityDetail({ defaultMetersPerPixel }: Props) {
	const { id } = useParams<{ id: string }>();
	const [city, setCity] = useState<CityMeta | null>(null);
	const [meta, setMeta] = useState<CityMetadata | null>(null);
	const [metersPerPixel, setMetersPerPixel] = useState<number>(defaultMetersPerPixel);

	useEffect(() => {
		fetch('/data/cities.json')
			.then((r) => r.json())
			.then((data: CityMeta[]) => {
				const found = data.find((c) => c.id === id);
				if (found) setCity(found);
			})
			.catch(() => {});
	}, [id]);

	useEffect(() => {
		if (!city) return;
		const metaPath = (city as any).metaPath as string | undefined;
		if (!metaPath) {
			setMeta({
				name: city.name,
				country: city.country
			});
			return;
		}
		fetch(metaPath)
			.then((r) => r.json())
			.then((data: CityMetadata) => setMeta(data))
			.catch(() => {
				setMeta({
					name: city.name,
					country: city.country
				});
			});
	}, [city]);

	if (!city) {
		return (
			<div className="app-main">
				<div className="empty">未找到该城市。</div>
			</div>
		);
	}

	return (
		<main className="app-main detail">
			<aside className="sidebar">
				<div className="section-title">{meta?.name ?? city.name}</div>
				<div className="meta">
					<div><b>国家/地区：</b>{meta?.country ?? city.country ?? '-'}</div>
					{meta?.region ? <div><b>区域：</b>{meta.region}</div> : null}
					{typeof meta?.population === 'number' ? <div><b>人口：</b>{meta.population.toLocaleString()}</div> : null}
					{typeof meta?.areaKm2 === 'number' ? <div><b>面积：</b>{meta.areaKm2.toLocaleString()} km²</div> : null}
					{typeof meta?.densityPerKm2 === 'number' ? <div><b>密度：</b>{meta.densityPerKm2.toLocaleString()} 人/km²</div> : null}
					{meta?.coordinates ? <div><b>中心坐标：</b>{meta.coordinates.lat.toFixed(3)}, {meta.coordinates.lon.toFixed(3)}</div> : null}
				</div>
				<div className="controls" style={{ marginTop: 12 }}>
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
				<div style={{ marginTop: 12 }}>
					<Link to="/" className="link">← 返回首页</Link>
				</div>
			</aside>
			<section className="canvas-grid cols-1">
				<div className="canvas-item">
					<div className="canvas-title">{city.name}{city.country ? `，${city.country}` : ''}</div>
					<CityMap city={city} metersPerPixel={city.preferredMpp ?? metersPerPixel} />
				</div>
				<div className="canvas-item" style={{ padding: 12 }}>
					<div className="canvas-title">历史简介</div>
					<div style={{ padding: 12, color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
						{meta?.history ?? '—'}
					</div>
				</div>
			</section>
		</main>
	);
}


