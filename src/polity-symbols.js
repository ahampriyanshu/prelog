// A symbol is only valid for its documented period. No modern flag fallback
// is allowed for a historical map, even when the polity name is similar.
export function selectSymbol(entries=[],snapshot=null,representative=false) {
  if(snapshot?.modern)return entries.find(s=>s.modernOnly)||null;
  if(Number.isFinite(snapshot?.year))return entries.filter(s=>!s.modernOnly&&Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.start<=snapshot.year&&s.end>=snapshot.year).sort((a,b)=>Number(b.kind==='flag')-Number(a.kind==='flag')||b.start-a.start)[0]||null;
  return representative?entries.at(-1)||null:null;
}
