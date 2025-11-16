import type { CityMeta } from '../App';

type Props = {
	cities: CityMeta[];
	selectedIds: string[];
	onToggleCity: (id: string) => void;
};

export function CitySelector({ cities, selectedIds, onToggleCity }: Props) {
	return (
		<div className="city-selector">
			<div className="section-title">城市列表</div>
			<ul className="city-list">
				{cities.map((c) => {
					const checked = selectedIds.includes(c.id);
					return (
						<li key={c.id}>
							<label className={`city-option ${checked ? 'checked' : ''}`}>
								<input
									type="checkbox"
									checked={checked}
									onChange={() => onToggleCity(c.id)}
								/>
								<span className="name">{c.name}</span>
								{c.country ? <span className="country">{c.country}</span> : null}
							</label>
						</li>
					);
				})}
			</ul>
		</div>
	);
}


